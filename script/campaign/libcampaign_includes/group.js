
////////////////////////////////////////////////////////////////////////////////
// Group functionality
////////////////////////////////////////////////////////////////////////////////

//;; ## camNewGroup()
//;;
//;; A saveload safe version of `newGroup()` so as not to create group ID clashes.
//;;
//;; @returns {number}
//;;
function camNewGroup()
{
	if (!camDef(__camNewGroupCounter))
	{
		__camNewGroupCounter = 0;
	}
	++__camNewGroupCounter;
	return __camNewGroupCounter;
}

//;; ## camInNeverGroup(droid)
//;;
//;; Check if this droid is forced to never group.
//;;
//;; @param {Object} droid
//;; @returns {boolean}
//;;
function camInNeverGroup(droid)
{
	if (droid.type !== DROID)
	{
		camDebug("Non-droid in camInNeverGroup.");
		return false;
	}
	for (let i = 0, l = __camNeverGroupDroids.length; i < l; ++i)
	{
		const __NEVERDROID_ID = __camNeverGroupDroids[i];
		if (droid.id === __NEVERDROID_ID)
		{
			return true;
		}
	}

	return false;
}

//;; ## camNeverGroupDroid(what[, playerFilter])
//;;
//;; A means to not auto group some droids.
//;;
//;; @param {string|Object|Object[]} what
//;; @param {number} [playerFilter]
//;; @returns {void}
//;;
function camNeverGroupDroid(what, playerFilter)
{
	if (!camDef(playerFilter))
	{
		playerFilter = ENEMIES;
	}
	let array;
	let obj;
	if (camIsString(what)) // label
	{
		obj = getObject(what);
	}
	else if (camDef(what.length)) // array
	{
		array = what;
	}
	else if (camDef(what.type)) // object
	{
		obj = what;
	}
	if (camDef(obj))
	{
		switch (obj.type) {
			case POSITION:
				obj = getObject(obj.x, obj.y);
				// fall-through
			case DROID:
			case STRUCTURE:
			case FEATURE:
				array = [ obj ];
				break;
			case AREA:
				array = enumArea(obj.x, obj.y, obj.x2, obj.y2, ALL_PLAYERS, false);
				break;
			case RADIUS:
				array = enumRange(obj.x, obj.y, obj.radius, ALL_PLAYERS, false);
				break;
			case GROUP:
				array = enumGroup(obj.id);
				break;
			default:
				camDebug("Unknown object type", obj.type);
		}
	}
	if (camDef(array))
	{
		for (let i = 0, l = array.length; i < l; ++i)
		{
			const o = array[i];
			if (!camDef(o) || !o)
			{
				continue;
			}
			if (o.type === DROID && camPlayerMatchesFilter(o.player, playerFilter))
			{
				__camNeverGroupDroids.push(o.id);
			}
		}
		return;
	}
	camDebug("Cannot parse", what);
}

//;; ## camMakeRefillableGroup(group, groupData, order, orderData)
//;; Create and manage a new group with a predefined set of unit templates. Useful for defining groups
//;; with a strict size and composition, such as commander squads.
//;; The group will try to replenish itself from active factories if it loses units.
//;; * `group` The group to manage, this can be set as undefined to make an initially empty group.
//;; * `groupData` Contains information on what should be in the group and how it should be refilled:
//;;	* `factories` A list of factory labels that this group should pull from. These factories will 
//;;	  have their normal templates overridden when necessary to refill this group. If empty or undefined,
//;;	  no factories will be used, which is useful if the group is meant to be resupplied by other means such
//;;	  as reinforcements.
//;;	* `globalFill` If true, pull units from all factories if `factories` is empty, undefined, or the set factories 
//;;	  are destroyed. Useful to avoid needing to list every single factory label in `factories`.
//;;	* `templates` The templates of units that this group is composed of. If units are missing from the 
//;;	  group, the list missing units can be found with the `camGetRefillableGroupTemplates()` function.
//;;	* `obj` An object, that when destroyed, disables this group from pulling from factories. If an object with this label 
//;;	is later found, resume automatic refilling. Useful for commander squads that should stop refilling when the commander is dead.
//;; * `order` The group order. (see tactics.js)
//;; * `orderData` The data associated with the group's order. (see tactics.js)
//;;
//;; @param {string} group
//;; @param {Object} groupData
//;; @param {number} order
//;; @param {Object} orderData
//;; @returns {number}
//;;
function camMakeRefillableGroup(group, groupData, order, orderData)
{
	if (!camDef(group))
	{
		group = camNewGroup();
	}

	camSetRefillableGroupData(group, groupData);

	orderData.removable = false; // Ensure that the group isn't removed if/when it is empty
	camManageGroup(group, order, orderData);
	return group;
}

//;; ## camSetRefillableGroupData(group, groupData)
//;;
//;; Adjust the data of a refillable group.
//;;
//;; @param {string} group
//;; @param {Object} groupData
//;; @returns {void}
//;;
function camSetRefillableGroupData(group, groupData)
{
	if (!camDef(groupData))
	{
		groupData = {}; // empty object
	}

	__camRefillableGroupInfo[group] = { // NOTE: if `factories` and `globalFill` are undefined, then the group will not automatically refill!
		factories: (camDef(groupData.factories)) ? groupData.factories : [],
		globalFill: (camDef(groupData.globalFill) && groupData.globalFill) ? groupData.globalFill : false,
		templates: (camDef(groupData.templates)) ? groupData.templates : [],
		obj: groupData.obj, // may be undefined. FIXME: Seems to get set to null instead?
		enabled: true // set to `false` when a defined `obj` is destroyed
	};
}

//;; ## camDisableRefillableGroup(group)
//;;
//;; Shortcut function that (permanently) disables a group from pulling more units automatically.
//;;
//;; @param {number} group
//;; @returns {void}
//;;
function camDisableRefillableGroup(group)
{
	camSetRefillableGroupData(group, {
		templates: __camRefillableGroupInfo[group].templates,
		obj: __camRefillableGroupInfo[group].obj,
		enabled: true
		// `factories` and `globalFill` are left blank
	});
}

//;; ## camGetRefillableGroupTemplates(group, allTemplates)
//;;
//;; Returns the templates of the units currently missing from the group
//;; If `allTemplates` is true, then returns the entire group template list instead
//;;
//;; @param {number|number[]} group
//;; @param {boolean} allTemplates
//;; @returns {Object}
//;;
function camGetRefillableGroupTemplates(group, allTemplates)
{
	if (group instanceof Array)
	{
		// If we were given an array of groups, the templates of all of them combined.
		let templates = [];
		for (g of group)
		{
			templates = templates.concat(camGetRefillableGroupTemplates(g, allTemplates));
		}
		return templates;
	}

	if (camDef(allTemplates) && allTemplates)
	{
		// Return the whole list
		return __camRefillableGroupInfo[group].templates;
	}
	// Otherwise, return whatever templates the group is missing
	return __camGetMissingGroupTemplates(group);
}

//;; ## camAssignToRefillableGroups(droids, groups)
//;;
//;; Assign droids from a given array to the provided refillable group(s).
//;; Returns an array containing any leftover droids that were not assigned.
//;;
//;; @param {Object[]} droids
//;; @param {number|number[]} groups
//;; @returns {Object[]}
//;;
function camAssignToRefillableGroups(droids, groups)
{
	let groupList;
	if (groups instanceof Array)
	{
		groupList = groups;
	}
	else
	{
		groupList = [groups];
	}

	// Next, assign other units to their refillable groups
	// Loop through the droids we have and match them to any missing templates
	const leftovers = [];
	for (const droid of droids)
	{
		let droidAssigned = false;

		for (const group of groupList)
		{
			if (droidAssigned) break;

			for (const template of camGetRefillableGroupTemplates(group))
			{
				if (camDroidMatchesTemplate(droid, template))
				{
					camGroupAdd(group, droid);
					droidAssigned = true;
					break;
				}
			}
		}

		// If this droid wasn't assigned to any group, add it to the return list.
		if (!droidAssigned) leftovers.push(droid);
	}
	return leftovers;
}

//;; ## camGroupAdd(group, droid)
//;;
//;; Wrapper for `groupAdd()` that also re-checks group morale.
//;;
//;; @param {number} group
//;; @returns {void}
//;;
function camGroupAdd(group, droid)
{
	groupAdd(group, droid);
	if (camDef(__camGroupInfo[group]))
	{
		profile("__camCheckGroupMorale", group);
	}
}

//////////// privates

// Return a list of all the templates in a refillable group's template list that can't be matched to a 
// unique droid in the group.
// If returnFirst is true, just return the first missing template we find.
// If a factory is defined, only return a template(s) that can be produced by the given factory.
function __camGetMissingGroupTemplates(group, returnFirst, factory)
{
	const droids = enumGroup(group);
	const templateList = __camRefillableGroupInfo[group].templates;
	const missingList = [];

	// FIXME: Roughly O(n^2) loop here (can this be improved?)
	for (let i = 0; i < templateList.length; i++)
	{
		const templ = templateList[i];

		// Make sure the missing template can be refilled by the given factory
		if (camDef(factory) && !camFactoryCanProduceTemplate(templateList[i], factory))
		{
			continue; // The given factory can't produce this template type; skip it.
		}
		
		let foundMatch = false;
		for (let j = 0; j < droids.length; j++)
		{
			const droid = droids[j];

			if (!camDef(droid))
			{
				// This droid has already been matched to different template
				continue;
			}
			
			// NOTE: Comparison only works for single-turret templates!
			if (camDroidMatchesTemplate(droid, templ))
			{
				// Remove this droid from the droids list; we don't want multiple templates matching to the same droid!
				delete droids[j]; // Set this element as undefined
				foundMatch = true;
				break;
			}
		}

		if (!foundMatch)
		{
			// If we never found a matching droid, add this template to the list of missing templates
			if (camDef(returnFirst) && returnFirst)
			{
				// Return the first missing template we find
				return templateList[i];
			}
			missingList.push(templateList[i]);
		}
	}

	return (camDef(returnFirst) && returnFirst) ? undefined : missingList;
}

// Gets a template to be built by the given factory
function __camGetRefillableTemplateForFactory(factoryLabel, factory)
{
	for (const group in __camRefillableGroupInfo)
	{
		const gi = __camRefillableGroupInfo[group];
		
		if (!gi.enabled)
		{
			continue; // Auto-refilling disabled
		}

		const __VALID_FACTORY = gi.factories.includes(factoryLabel);
		
		// Check if the given factory can resupply this group
		if (__VALID_FACTORY || (!__VALID_FACTORY && gi.globalFill))
		{
			// If so, see if this group is missing any templates
			const missingTempl = __camGetMissingGroupTemplates(group, true, factory);
			if (camDef(missingTempl))
			{
				// Return the template and the group to send it to
				return {group: group, template: missingTempl};
			}
		}
	}
}

function __checkRefillableGroupObject()
{
	for (const group in __camRefillableGroupInfo)
	{
		if (camDef(__camRefillableGroupInfo[group].obj))
		{
			if (getObject(__camRefillableGroupInfo[group].obj) === null)
			{
				// `obj` destroyed, disable auto refilling
				__camRefillableGroupInfo[group].enabled = false;
			}
			else
			{
				// `obj` rebuilt, re-enable auto refilling
				__camRefillableGroupInfo[group].enabled = true;
			}
		}
	}
}
