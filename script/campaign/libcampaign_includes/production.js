
////////////////////////////////////////////////////////////////////////////////
// Factory production management.
////////////////////////////////////////////////////////////////////////////////

// To use this feature, call camSetFactories() with a list of factories.
// This assumes tactical management of groups of units produced from them.
// Factories won't start production immediately; call camEnableFactory()
// to turn them on.

//;; ## camSetFactories(factories)
//;;
//;; Tell `libcampaign.js` to manage a certain set of enemy factories.
//;; Management assumes producing droids, packing them into groups and
//;; executing orders once the group becomes large-enough.
//;; The argument is a JavaScript map from group labels to factory descriptions.
//;; Each label points to a factory object.
//;; Factory description is a JavaScript object with the following fields:
//;; * `assembly` A rally point position label, where the group would gather.
//;; * `order` An order to execute for every group produced in the factory. Same as the order parameter for `camManageGroup()`.
//;; * `data` Order data. Same as the data parameter for `camManageGroup()`.
//;; * `groupSize` Number of droids to produce before executing the order.
//;;   Also, if order is `CAM_ORDER_ATTACK`, data.count defaults to this value.
//;; * `maxSize` Halt production when reaching that many droids in the factory group.
//;;   Resume when some droids die. Unlimited if unspecified.
//;; * `throttle` If defined, produce droids only every that many milliseconds, and keep the factory idle between ticks.
//;; * `group` If defined, make the factory manage this group, otherwise create a new empty group to manage.
//;;   Droids produced in the factory would automatically be added to the group,
//;;   and order and data parameters would be applied to this group.
//;; * `templates` List of droid templates to produce in the factory.
//;;   Each template is a JavaScript object with the following fields:
//;;   * `body` Body stat name.
//;;   * `prop` Propulsion stat name.
//;;   * `weap` Weapon stat name. Only single-turret droids are currently supported.
//;;   Note that all template components are automatically made available to the factory owner.
//;; Factories won't start production immediately; call `camEnableFactory()` to turn them on when necessary.
//;;
//;; @param {Object} factories
//;; @returns {void}
//;;
function camSetFactories(factories)
{
	for (const factoryLabel in factories)
	{
		camSetFactoryData(factoryLabel, factories[factoryLabel]);
	}
}

//;; ## camSetFactoryData(factoryLabel, factoryData)
//;;
//;; Similar to `camSetFactories()`, but one factory at a time.
//;; If the factory was already managing a group of droids, it keeps managing it.
//;; If a new group is specified in the description, the old group is merged into it.
//;; NOTE: This function disables the factory. You would need to call `camEnableFactory()` again.
//;;
//;; @param {string} factoryLabel
//;; @param {Object} factoryData
//;; @returns {void}
//;;
function camSetFactoryData(factoryLabel, factoryData)
{
	const structure = getObject(factoryLabel);
	if (!camDef(structure) || !structure)
	{
		// Not an error! It's ok if the factory is already destroyed
		// when its data was updated.
		camTrace("Factory", factoryLabel, "not found");
		return;
	}
	// remember the old factory group, if any
	let droids = [];
	if (camDef(__camFactoryInfo[factoryLabel]))
	{
		droids = enumGroup(__camFactoryInfo[factoryLabel].group);
	}
	__camFactoryInfo[factoryLabel] = factoryData;
	const fi = __camFactoryInfo[factoryLabel];
	if (!camDef(fi.data))
	{
		fi.data = {};
	}
	fi.enabled = false;
	fi.state = 0;
	// // Record the coordinates, player, and type of this factory, in case it is destroyed and rebuilt
	// fi.x = structure.x;
	// fi.y = structure.y;
	// fi.player = structure.player;
	// fi.stattype = structure.stattype;
	// Automatically re-manage this factory if it's destroyed and rebuilt
	camAutoReplaceObjectLabel(factoryLabel);
	if (!camDef(fi.group))
	{
		fi.group = camNewGroup();
	}
	for (let i = 0, l = droids.length; i < l; ++i)
	{
		const droid = droids[i];
		camGroupAdd(fi.group, droid);
	}
	if (!camDef(fi.data.count))
	{
		fi.data.count = fi.groupSize;
	}
}

//;; ## camEnableFactory(factoryLabel)
//;;
//;; Enable a managed factory by the given label.
//;; Once the factory is enabled, it starts producing units and executing orders as given.
//;;
//;; @param {string} factoryLabel
//;; @returns {void}
//;;
function camEnableFactory(factoryLabel)
{
	const fi = __camFactoryInfo[factoryLabel];
	if (!camDef(fi) || !fi)
	{
		camDebug("Factory not managed", factoryLabel);
		return;
	}
	if (fi.enabled)
	{
		// safe, no error
		camTrace("Factory", factoryLabel, "enabled again");
		return;
	}
	camTrace("Enabling", factoryLabel);
	fi.enabled = true;
	const obj = getObject(factoryLabel);
	if (!camDef(obj) || !obj)
	{
		camTrace("Factory", factoryLabel, "not found, probably already dead");
		return;
	}
	__camContinueProduction(factoryLabel);
	__camFactoryUpdateTactics(factoryLabel);
}

//;; ## camQueueDroidProduction(playerId, template[, position])
//;;
//;; Queues up an extra droid template for production.
//;; It would be produced in the first factory that is capable of producing it,
//;; at the end of its production loop, first queued first served.
//;; If a position is given, then ensure the produced droid can reach that position.
//;;
//;; @param {number} playerId
//;; @param {Object} template
//;; @param {Object} position
//;; @returns {void}
//;;
function camQueueDroidProduction(playerId, template, position)
{
	if (!camDef(__camFactoryQueue[playerId]))
	{
		__camFactoryQueue[playerId] = [];
	}
	__camFactoryQueue[playerId][__camFactoryQueue[playerId].length] = {template: template, position: camMakePos(position)};
}

//;; ## camSetPropulsionTypeLimit([limit])
//;;
//;; This function can automatically augment units to use Type I/II/III propulsions.
//;; If nothing or zero is passed in then the type limit will match what is in templates.json.
//;;
//;; @param {number} [limit]
//;; @returns {void}
//;;
function camSetPropulsionTypeLimit(limit)
{
	if (!camDef(limit) || !limit)
	{
		__camPropulsionTypeLimit = "NO_USE";
	}
	else if (limit === 1)
	{
		__camPropulsionTypeLimit = "01";
	}
	else if (limit === 2)
	{
		__camPropulsionTypeLimit = "02";
	}
	else if (limit === 3)
	{
		__camPropulsionTypeLimit = "03";
	}
	else
	{
		camTrace("Unknown propulsion level specified. Use 1 - 3 to force the propulsion type, 0 to disable.");
	}
}

//;; ## camUpgradeOnMapTemplates(template1, template2, playerId[, excluded])
//;;
//;; Search for `template1`, save its coordinates, remove it, and then replace with it with `template2`.
//;; Template objects are expected to follow the component properties as used in `templates.js`.
//;; A fourth parameter can be specified to ignore specific object IDs.
//;; Useful if a droid is assigned to an object label. It can be either an array or a single ID number.
//;;
//;; @param {Object} template1
//;; @param {Object} template2
//;; @param {number} playerId
//;; @param {number|number[]} [excluded]
//;; @returns {void}
//;;
function camUpgradeOnMapTemplates(template1, template2, playerId, excluded)
{
	if (!camDef(template1) || !camDef(template2) || !camDef(playerId))
	{
		camDebug("Not enough parameters specified for upgrading on map templates");
		return;
	}

	const droidsOnMap = enumDroid(playerId);

	for (let i = 0, l = droidsOnMap.length; i < l; ++i)
	{
		const dr = droidsOnMap[i];
		if (!camDef(dr.weapons[0]))
		{
			continue; //don't handle systems
		}
		const __BODY = dr.body;
		const __PROP = dr.propulsion;
		const __WEAP = dr.weapons[0].name;
		let skip = false;
		if (__BODY === template1.body && __PROP === template1.prop && __WEAP === template1.weap)
		{
			//Check if this object should be excluded from the upgrades
			if (camDef(excluded))
			{
				if (excluded instanceof Array)
				{
					for (let j = 0, c = excluded.length; j < c; ++j)
					{
						if (dr.id === excluded[j])
						{
							skip = true;
							break;
						}
					}
					if (skip === true)
					{
						continue;
					}
				}
				else if (dr.id === excluded)
				{
					continue;
				}
			}

			//Check if this object has a label and/or group assigned to it
			// FIXME: O(n) lookup here
			const __DROID_LABEL = getLabel(dr);
			const __DROID_GROUP = dr.group;

			//Replace it
			const droidInfo = {x: dr.x, y: dr.y, name: dr.name};
			camSafeRemoveObject(dr, false);
			const newDroid = addDroid(playerId, droidInfo.x, droidInfo.y, droidInfo.name, template2.body,
				__camChangePropulsion(template2.prop, playerId), "", "", template2.weap);

			if (camDef(__DROID_LABEL)) 
			{
				addLabel(newDroid, __DROID_LABEL);
			}
			if (__DROID_GROUP !== null)
			{
				groupAdd(__DROID_GROUP, newDroid);
			}
			camSetDroidExperience(newDroid);
		}
	}
}

//;; ## camUpgradeOnMapStructures(struct1, struct2, playerId[, excluded])
//;;
//;; Search for struct1, save its coordinates, remove it, and then replace with it
//;; with struct2. A fourth parameter can be specified to ignore specific object
//;; IDs. Useful if a structure is assigned to an object label. It can be either an array
//;; or a single ID number. Unortunatly, structure rotation is not preserved.
//;; If a structure has a label or group, it will be transferred to the replacement, but if the
//;; structure has multiple labels, then only one label will be transferred.
//;;
//;; @param {Object} struct1
//;; @param {Object} struct2
//;; @param {number} playerId
//;; @param {number|number[]} [excluded]
//;; @returns {void}
//;;
function camUpgradeOnMapStructures(struct1, struct2, playerId, excluded)
{
	if (!camDef(struct1) || !camDef(struct2) || !camDef(playerId))
	{
		camDebug("Not enough parameters specified for upgrading on map structures");
		return;
	}

	const structsOnMap = enumStruct(playerId, struct1);

	for (let i = 0, l = structsOnMap.length; i < l; ++i)
	{
		const structure = structsOnMap[i];
		let skip = false;
		
		//Check if this object should be excluded from the upgrades
		if (camDef(excluded))
		{
			if (excluded instanceof Array)
			{
				for (let j = 0, c = excluded.length; j < c; ++j)
				{
					if (structure.id === excluded[j])
					{
						skip = true;
						break;
					}
				}
				if (skip === true)
				{
					continue;
				}
			}
			else if (structure.id === excluded)
			{
				continue;
			}
		}

		//Check if this object has a label and/or group assigned to it
		// FIXME: O(n) lookup here
		const __STRUCT_LABEL = getLabel(structure);
		const __STRUCT_GROUP = structure.group;

		//Replace it
		const structInfo = {x: structure.x * 128, y: structure.y * 128};
		camSafeRemoveObject(structure, false);
		const newStruct = addStructure(struct2, playerId, structInfo.x, structInfo.y);

		if (camDef(__STRUCT_LABEL)) 
		{
			addLabel(newStruct, __STRUCT_LABEL);
		}
		if (__STRUCT_GROUP !== null)
		{
			groupAdd(__STRUCT_GROUP, newStruct);
		}
	}
}

//;; ## camSetPreDamageModifier(playerId, droidRange[, structRange[, excludedTemplates]])
//;;
//;; Damages all units and structures belonging to the given player to the given HP ranges.
//;; Applies this modifier to all units and structures currently on the map, as well as any units
//;; either produced or brought in via reinforcements later in the mission.
//;; Ignores any units that match the list of excluded templates.
//;; Ranges should be specified as [LOWER_BOUND, UPPER_BOUND] (e.g. [40, 70] for 40% to 70% HP)
//;;
//;; @param {number} playerId
//;; @param {number[]} droidRange
//;; @param {number[]} structRange
//;; @param {Object[]} [excluded]
//;; @returns {void}
//;;
function camSetPreDamageModifier(playerId, droidRange, structRange, excludedTemplates)
{
	__camPreDamageModifier[playerId] = {
		droidRange: droidRange,
		structRange: (camDef(structRange)) ? structRange : droidRange,
		excludedTemplates: excludedTemplates
	};

	const droids = enumDroid(playerId);
	for (droid of droids)
	{
		__camPreDamageDroid(droid);
	}

	const structures = enumStruct(playerId);
	for (struct of structures)
	{
		__camPreDamageStruct(struct)
	}
}

//;; ## camDisableInfAutoManagement()
//;;
//;; Disables automatically grouping and ordering units produced by player CAM_INFESTED (player 4).
//;; Useful for levels where player 4 is not used for the Infested.
//;;
//;; @returns {void}
//;;
function camDisableInfAutoManagement()
{
	__camDisableFactoryAutoManagement = true;
}

//////////// privates

function __camFactoryUpdateTactics(flabel)
{
	const fi = __camFactoryInfo[flabel];
	if (!fi.enabled)
	{
		camDebug("Factory", flabel, "was not enabled");
		return;
	}
	const droids = enumGroup(fi.group);
	if (droids.length >= fi.groupSize)
	{
		camManageGroup(fi.group, fi.order, fi.data);
		fi.group = camNewGroup();
	}
	else
	{
		let pos = camMakePos(fi.assembly);
		if (!camDef(pos))
		{
			pos = camMakePos(flabel);
		}
		camManageGroup(fi.group, CAM_ORDER_DEFEND, { pos: pos, radius: __CAM_ASSEMBLY_DEFENSE_RADIUS });
	}
}

function __camAddDroidToFactoryGroup(droid, structure)
{
	// don't manage trucks in this function
	if (droid.droidType === DROID_CONSTRUCT)
	{
		return;
	}
	// FIXME: O(n) lookup here
	const __FLABEL = getLabel(structure);
	if (!camDef(__FLABEL) || !__FLABEL)
	{
		return;
	}
	const fi = __camFactoryInfo[__FLABEL];
	if (camDef(fi.assignGroup))
	{
		// Assign the droid to an alternate group
		camGroupAdd(fi.assignGroup, droid);
		delete __camFactoryInfo[__FLABEL].assignGroup;
	}
	else
	{
		camGroupAdd(fi.group, droid);
	}
	if (camDef(fi.assembly))
	{
		// this is necessary in case droid is regrouped manually
		// in the scenario code, and thus DORDER_DEFEND for assembly
		// will not be applied in __camFactoryUpdateTactics()
		const pos = camMakePos(fi.assembly);
		orderDroidLoc(droid, DORDER_MOVE, pos.x, pos.y);
	}
	__camFactoryUpdateTactics(__FLABEL);
}

function __camChangePropulsion(propulsion, playerId)
{
	if (__camPropulsionTypeLimit === "NO_USE" || playerId === CAM_HUMAN_PLAYER)
	{
		return propulsion;
	}

	let name = propulsion;
	const validProp = ["CyborgLegs", "HalfTrack", "V-Tol", "hover", "tracked", "wheeled"];
	const specProps = ["CyborgLegs", "HalfTrack", "V-Tol"]; //Some have "01" at the end and others don't for the base ones.

	const __LAST_TWO = name.substring(name.length - 2);
	if (__LAST_TWO === "01" || __LAST_TWO === "02" || __LAST_TWO === "03")
	{
		name = name.substring(0, name.length - 2);
	}

	for (let i = 0, l = validProp.length; i < l; ++i)
	{
		const __CURRENT_PROP = validProp[i];
		if (name === __CURRENT_PROP)
		{
			if ((__camPropulsionTypeLimit === "01") && (specProps.indexOf(__CURRENT_PROP) !== -1))
			{
				return __CURRENT_PROP;
			}
			return __CURRENT_PROP.concat(__camPropulsionTypeLimit);
		}
	}

	//If all else fails then return the propulsion that came with the template
	return propulsion;
}

function __camBuildDroid(template, structure)
{
	if (!camDef(structure))
	{
		return false;
	}

	if (template.prop === __camChangePropulsion("V-Tol", structure.player) && structure.stattype !== VTOL_FACTORY)
	{
		// If not a VTOL factory and the template is a VTOL then keep it in the
		// queue until a factory can deal with it.
		return false;
	}
	if (template.prop === __camChangePropulsion("CyborgLegs", structure.player) && structure.stattype !== CYBORG_FACTORY)
	{
		// Likewise, if not a cyborg factory and the template is a cyborg then
		// keep it in the queue until a cyborg factory can deal with it.
		return false;
	}
	if ((template.prop === __camChangePropulsion("wheeled01", structure.player) || template.prop === __camChangePropulsion("HalfTrack", structure.player) 
		|| template.prop === __camChangePropulsion("tracked01", structure.player) || template.prop === __camChangePropulsion("hover01", structure.player)) 
		&& structure.stattype !== FACTORY)
	{
		// Finally, don't build normal units in cyborg or VTOL factories
		return false;
	}

	const __PROP = __camChangePropulsion(template.prop, structure.player);
	makeComponentAvailable(template.body, structure.player);
	makeComponentAvailable(__PROP, structure.player);
	const __NAME = camNameTemplate(template.weap, template.body, __PROP);
	// multi-turret templates are NOW supported :)
	if (typeof template.weap === "object" && camDef(template.weap[2]))
	{
		makeComponentAvailable(template.weap[0], structure.player);
		makeComponentAvailable(template.weap[1], structure.player);
		makeComponentAvailable(template.weap[2], structure.player);
		return buildDroid(structure, __NAME, template.body, __PROP, "", "", template.weap[0], template.weap[1], template.weap[2]);
	}
	else if (typeof template.weap === "object" && camDef(template.weap[1]))
	{
		makeComponentAvailable(template.weap[0], structure.player);
		makeComponentAvailable(template.weap[1], structure.player);
		return buildDroid(structure, __NAME, template.body, __PROP, "", "", template.weap[0], template.weap[1]);
	}
	else
	{
		makeComponentAvailable(template.weap, structure.player);
		return buildDroid(structure, __NAME, template.body, __PROP, "", "", template.weap);
	}
}

//Check if an enabled factory can begin manufacturing something. Doing this
//by timer has the perk of not breaking production if something went wrong in
//cam_eventDroidBuilt (or the mere act of reloading saves).
function __checkEnemyFactoryProductionTick()
{
	for (const flabel in __camFactoryInfo)
	{
		if (getObject(flabel) !== null && __camFactoryInfo[flabel].enabled === true)
		{
			__camContinueProduction(flabel);
		}
	}
}

function __camContinueProduction(structure)
{
	let flabel;
	let struct;
	if (camIsString(structure))
	{
		flabel = structure;
		struct = getObject(flabel);
		if (!camDef(struct) || !struct)
		{
			camTrace("Factory not found");
			return;
		}
	}
	else
	{
		// FIXME: O(n) lookup here
		flabel = getLabel(structure);
		struct = structure;
	}
	if (!camDef(flabel) || !flabel)
	{
		return;
	}
	if (!structureIdle(struct))
	{
		return;
	}

	// check factory queue
	const __PLAYER = struct.player;
	if (camDef(__camFactoryQueue[__PLAYER]) && __camFactoryQueue[__PLAYER].length > 0)
	{
		// Search sequentially through the queue
		for (let i = 0; i < __camFactoryQueue[__PLAYER].length; i++)
		{
			const template = __camFactoryQueue[__PLAYER][i].template
			const destPos = __camFactoryQueue[__PLAYER][i].position;

			if (camDef(destPos))
			{
				// If a position is defined, only build this droid if we are the closest viable factory
				let closestLabel = null;
				let closestDist = -1;
				// Loop through each factory label
				for (const compareLabel in __camFactoryInfo)
				{
					// If the factory exists and is enabled...
					if (getObject(compareLabel) !== null && __camFactoryInfo[compareLabel].enabled === true)
					{
						const factoryStruct = getObject(compareLabel);
						const structPos = camMakePos(struct);
						// Check if the factory can produce this template and the template can reach the position...
						if (propulsionCanReach(template.prop, structPos.x, structPos.y, destPos.x, destPos.y)
							&& camFactoryCanProduceTemplate(template, factoryStruct))
						{
							const FACTORY_DIST = camDist(structPos.x, structPos.y, destPos.x, destPos.y);
							// ...Then check if this factory is the closest one we've found...
							if (FACTORY_DIST < closestDist || closestDist < 0)
							{
								closestDist = FACTORY_DIST;
								closestLabel = compareLabel;
							}
						}
					}

					// Check if our factory is the closest viable one we've found
					if (closestDist > 0 && flabel === closestLabel)
					{
						// If so, then attempt to build
						if (__camBuildDroid(template, struct))
						{
							__camFactoryQueue[__PLAYER].shift();
							return; // Don't update the last production time
						}
					}
				}
			}
			else
			{
				// No position set, just try to build the droid here...
				if (camFactoryCanProduceTemplate(template, struct)
					&& __camBuildDroid(template, struct))
				{
					__camFactoryQueue[__PLAYER].shift();
					return; // Don't update the last production time
				}
			}
		}
		// TODO: Check past the first item in the queue?
		// Only build if destination is reachable or undefined
	}

	const fi = __camFactoryInfo[flabel];

	// Only continue if this factory is enabled
	if (!fi.enabled)
	{
		return;
	}

	if (camDef(fi.maxSize) && groupSize(fi.group) >= fi.maxSize)
	{
		// retry later
		return;
	}

	if (camDef(fi.throttle) && camDef(fi.lastprod))
	{
		const __THROTTLE = gameTime - fi.lastprod;
		if (__THROTTLE < fi.throttle)
		{
			// do throttle
			return;
		}
	}

	// reset factory loop
	if (fi.state === -1)
	{
		fi.state = 0;
	}

	// Check if a refillable group needs a replacement unit
	const refillableTemplate = __camGetRefillableTemplateForFactory(flabel, struct);
	if (camDef(refillableTemplate))
	{
		// Build this template instead, and assign it to the refillable group
		__camFactoryInfo[flabel].assignGroup = refillableTemplate.group;
		__camBuildDroid(refillableTemplate.template, struct);
	}
	else // Build the standard unit
	{
		if (camDef(fi.templates[fi.state]))
		{
			__camBuildDroid(fi.templates[fi.state], struct);
		}
		// loop through templates
		++fi.state;
		if (fi.state >= fi.templates.length)
		{
			fi.state = -1;
		}
	}
	fi.lastprod = gameTime;
}

// Pre-damage a newly spawned droid
function __camPreDamageDroid(droid)
{
	if (!camDef(__camPreDamageModifier[droid.player]) && __camPreDamageModifier[droid.player] !== null)
	{
		// No modifier set
		return;
	}

	// Check if this droid is excluded
	const droidRange = __camPreDamageModifier[droid.player].droidRange;
	const DIFF = droidRange[1] - droidRange[0];
	const excludedTemplates = __camPreDamageModifier[droid.player].excludedTemplates;
	if (camDef(excludedTemplates))
	{
		// Check if this droid is excluded
		let excluded = false;
		for (template of excludedTemplates)
		{
			if (camDroidMatchesTemplate(droid, template))
			{
				excluded = true;
				break;
			}
		}

		if (!excluded)
		{
			// Apply pre-damage to this droid...
			setHealth(droid, droidRange[0] + camRand(DIFF + 1));
		}
	}
	else
	{
		// Apply pre-damage to this droid...
		setHealth(droid, droidRange[0] + camRand(DIFF + 1));
	}
}

// Pre-damage a structure
function __camPreDamageStruct(struct)
{
	if (!camDef(__camPreDamageModifier[struct.player]) && __camPreDamageModifier[struct.player] !== null)
	{
		// No modifier set
		return;
	}

	// Apply pre-damage to this structure...
	const structRange = __camPreDamageModifier[struct.player].structRange;
	const DIFF = structRange[1] - structRange[0];
	setHealth(struct, structRange[0] + camRand(DIFF + 1));
}
