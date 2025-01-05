
////////////////////////////////////////////////////////////////////////////////
// VTOL management.
// These functions create the hit and run vtols for the given player.
// Vtol rearming is handled in group management.
////////////////////////////////////////////////////////////////////////////////

//;; ## camSetVtolData(player, startPos, exitPos, templates, timer, [obj[, extras]])
//;;
//;; Setup hit and runner VTOLs. NOTE: Will almost immediately spawn VTOLs upon calling this function.
//;; `Player`: What player number the VTOLs will belong to.
//;; `StartPos`: Starting position object where VTOLs will spawn. Can be an array. Use undefined for random map edge location.
//;; `ExitPos`: Exit position object where VTOLs will despawn at.
//;; `Templates`: An array of templates that the spawn uses.
//;; `Timer`: How much time in milliseconds the VTOLs will wait to spawn again.
//;; `Obj`: A game object that will stop the spawn when it no longer exists. May be undefined for no explicit end condition.
//;; `Extras`: An object with possible members:
//;;		`limit`: Numeric limit of a VTOL design in regards to the parameter Templates. May be an array paired to Templates.
//;;		`alternate`: A boolean to force the spawn to use one of the designs at a time in parameter Templates.
//;;		`altIdx`: Which design index the spawn will first cycle through the list of templates from.
//;;		`minVTOLs`: Minimum amount of VTOLs that will spawn.
//;;		`maxRandomVTOLs`: Random amount of VTOLs that will spawn in addition to minVTOLs.
//;;
//;; @param {number} player
//;; @param {Object|Object[]|undefined} startPos
//;; @param {Object} exitPos
//;; @param {Object[]} templates
//;; @param {number} timer
//;; @param {Object} obj
//;; @param {Object} extras
//;; @returns {void}
//;;
function camSetVtolData(player, startPos, exitPos, templates, timer, obj, extras)
{
	__camVtolDataSystem.push({
		player: player,
		startPosition: startPos,
		exitPosition: camMakePos(exitPos),
		templates: templates,
		spawnStopObject: obj,
		extras: extras,
		timer: timer,
		nextSpawnTime: timer + gameTime,
		isFirstSpawn: true,
		active: true,
		dynamic: extras.dynamic,
		dMultiplier: 1.0
	});
}

//;; ## camSetVtolSpawnState(state, identifier)
//;;
//;; Sets the active status of a VTOL spawn point. The identifier can either be the
//;; the index number or the label of the object that stops the spawn naturally.
//;;
//;; @param {boolean} state
//;; @param {number|string} identifier
//;; @returns {void}
//;;
function camSetVtolSpawnState(state, identifier)
{
	if (typeof identifier === "number")
	{
		__camVtolDataSystem[identifier].active = state;
	}
	else if (typeof identifier === "string")
	{
		for (let idx = 0, len = __camVtolDataSystem.length; idx < len; ++idx)
		{
			if (__camVtolDataSystem[idx].spawnStopObject === identifier)
			{
				__camVtolDataSystem[idx].active = state;
			}
		}
	}
	else
	{
		camDebug("camSetVtolSpawn() expected a number or game object label string");
	}
}

//;; ## camSetVtolSpawnStateAll(state)
//;;
//;; Sets the active status of all VTOL spawns to `state`.
//;;
//;; @param {boolean} state
//;; @returns {void}
//;;
function camSetVtolSpawnStateAll(state)
{
	for (let idx = 0, len = __camVtolDataSystem.length; idx < len; ++idx)
	{
		camSetVtolSpawnState(state, idx);
	}
}

//////////// privates

function __checkVtolSpawnObject()
{
	for (let idx = 0, len = __camVtolDataSystem.length; idx < len; ++idx)
	{
		if (/*__camVtolDataSystem[idx].active && */camDef(__camVtolDataSystem[idx].spawnStopObject))
		{
			if (getObject(__camVtolDataSystem[idx].spawnStopObject) === null)
			{
				camSetVtolSpawnState(false, idx); //Deactivate hit and runner VTOLs.
			}
			else
			{
				camSetVtolSpawnState(true, idx); // Remain active/reactivate
			}
		}
	}
}

function __camSpawnVtols()
{
	for (let idx = 0; idx < __camVtolDataSystem.length; ++idx)
	{
		if (!__camVtolDataSystem[idx].active)
		{
			continue;
		}
		if (gameTime < __camVtolDataSystem[idx].nextSpawnTime)
		{
			if (__camVtolDataSystem[idx].isFirstSpawn)
			{
				__camVtolDataSystem[idx].isFirstSpawn = false;
			}
			else
			{
				continue;
			}
		}
		else
		{
			if (camDef(__camVtolDataSystem[idx].timer))
			{
				__camVtolDataSystem[idx].nextSpawnTime = gameTime + (__camVtolDataSystem[idx].timer * __camVtolDataSystem[idx].dMultiplier);
			}
			else
			{
				// One-time VTOL spawn
				__camVtolDataSystem[idx].active = false;
			}
		}

		// Default VTOL amounts
		let minVtolAmount = 5;
		let maxRandomAdditions = 2;

		if (camDef(__camVtolDataSystem[idx].extras))
		{
			if (camDef(__camVtolDataSystem[idx].extras.minVTOLs))
			{
				minVtolAmount = __camVtolDataSystem[idx].extras.minVTOLs;
			}
			if (camDef(__camVtolDataSystem[idx].extras.maxRandomVTOLs))
			{
				maxRandomAdditions = __camVtolDataSystem[idx].extras.maxRandomVTOLs;
			}
		}

		const __AMOUNT = minVtolAmount + camRand(maxRandomAdditions + 1);
		const droids = [];
		let pos;
		let targetPlayer;
		let ignorePlayers;
		let targetPos;
		let targetRadius;

		//Make sure to catch multiple start positions also.
		if (__camVtolDataSystem[idx].startPosition instanceof Array)
		{
			pos = __camVtolDataSystem[idx].startPosition[camRand(__camVtolDataSystem[idx].startPosition.length)];
		}
		else if (camDef(__camVtolDataSystem[idx].startPosition) && __camVtolDataSystem[idx].startPosition)
		{
			pos = __camVtolDataSystem[idx].startPosition;
		}
		else
		{
			pos = camGenerateRandomMapEdgeCoordinate();
		}

		if (!camDef(__camVtolDataSystem[idx].extras))
		{
			//Pick some droids randomly.
			for (let i = 0; i < __AMOUNT; ++i)
			{
				droids.push(__camVtolDataSystem[idx].templates[camRand(__camVtolDataSystem[idx].templates.length)]);
			}
		}
		else
		{
			let lim = __AMOUNT;
			let alternate = false;
			targetPlayer = __camVtolDataSystem[idx].extras.targetPlayer;
			ignorePlayers = __camVtolDataSystem[idx].extras.ignorePlayers;
			targetPos = __camVtolDataSystem[idx].extras.pos;
			targetRadius = __camVtolDataSystem[idx].extras.radius;
			if (camDef(__camVtolDataSystem[idx].extras.alternate))
			{
				alternate = __camVtolDataSystem[idx].extras.alternate; //Only use one template type
			}
			if (!camDef(__camVtolDataSystem[idx].extras.altIdx))
			{
				__camVtolDataSystem[idx].extras.altIdx = 0;
			}
			if (camDef(__camVtolDataSystem[idx].extras.limit))
			{
				//support an array of limits for each template
				if (__camVtolDataSystem[idx].extras.limit instanceof Array)
				{
					lim = __camVtolDataSystem[idx].extras.limit[__camVtolDataSystem[idx].extras.altIdx]; //max templates to use
				}
				else
				{
					lim = __camVtolDataSystem[idx].extras.limit;
				}
			}

			for (let i = 0; i < lim; ++i)
			{
				if (!alternate)
				{
					droids.push(__camVtolDataSystem[idx].templates[camRand(__camVtolDataSystem[idx].templates.length)]);
				}
				else
				{
					droids.push(__camVtolDataSystem[idx].templates[__camVtolDataSystem[idx].extras.altIdx]);
				}
			}

			if (__camVtolDataSystem[idx].extras.altIdx < (__camVtolDataSystem[idx].templates.length - 1))
			{
				++__camVtolDataSystem[idx].extras.altIdx;
			}
			else
			{
				__camVtolDataSystem[idx].extras.altIdx = 0;
			}
		}

		//...And send them.
		// (Also store the group of the new VTOLs)
		const group = camSendReinforcement(__camVtolDataSystem[idx].player, camMakePos(pos), droids, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_ATTACK,
			data: { regroup: false, count: -1, targetPlayer: targetPlayer, ignorePlayers: ignorePlayers, pos: targetPos, radius: targetRadius}
		});

		if (__camVtolDataSystem[idx].dynamic)
		{
			// If dynamic mode is enabled, assume all VTOLs will die, and adjust the time modifier accordingly.
			// When all VTOLs die, the multiplier increases by 0.5, up to a max of 2x spawn delay.
			// If all VTOLs end up surviving, the multiplier will decrease by a net change of 0.5, down to 0.5x spawn delay (or double speed).
			__camVtolDataSystem[idx].dMultiplier = Math.min(2.0, __camVtolDataSystem[idx].dMultiplier + 0.5);

			// Store a list of the VTOL droid IDs
			const groupDroids = enumGroup(group);
			__camVtolDataSystem[idx].vtolIds = [];
			for (const droid of groupDroids)
			{
				__camVtolDataSystem[idx].vtolIds.push(droid.id);
			}
		}
	}
}

function __camRetreatVtols()
{
	for (let idx = 0; idx < __camVtolDataSystem.length; ++idx)
	{
		if (camDef(__camVtolDataSystem[idx].exitPosition.x) &&
			camDef(__camVtolDataSystem[idx].exitPosition.y) &&
			enumStruct(__camVtolDataSystem[idx].player, REARM_PAD).length === 0)
		{
			const __VTOL_RETURN_HEALTH = 40; // run-away if health is less than...
			const __VTOL_RETURN_ARMED = 1; // run-away if weapon ammo is less than...
			const vtols = enumDroid(__camVtolDataSystem[idx].player).filter((obj) => (isVTOL(obj)));

			for (let i = 0, len = vtols.length; i < len; ++i)
			{
				const vt = vtols[i];
				for (let c = 0, len2 = vt.weapons.length; c < len2; ++c)
				{
					if ((vt.order === DORDER_RTB) || (vt.weapons[c].armed < __VTOL_RETURN_ARMED)) // || vt.health < VTOL_RETURN_HEALTH)
					{
						orderDroidLoc(vt, DORDER_MOVE, __camVtolDataSystem[idx].exitPosition.x, __camVtolDataSystem[idx].exitPosition.y);
						break;
					}
				}
			}
		}
	}
}

// Called when a VTOL successfully escapes the map
// Used to update dynamic VTOL spawn times
function __camVtolEscaped(id)
{
	// Check which VTOL system the escapee belongs to
	for (let idx = 0; idx < __camVtolDataSystem.length; ++idx)
	{
		if (__camVtolDataSystem[idx].dynamic)
		{
			// See if this VTOL matches one of the ones in the system group
			for (const vtolId of __camVtolDataSystem[idx].vtolIds)
			{
				if (id === vtolId)
				{
					// Reduce the time multiplier
					// NOTE: the (* 2) part is to offset the presumptive change made when the VTOLs were spawned
					__camVtolDataSystem[idx].dMultiplier = Math.max(0.5, __camVtolDataSystem[idx].dMultiplier - (0.5 / __camVtolDataSystem[idx].vtolIds.length * 2));
					// console("dMultiplier reduced to " + __camVtolDataSystem[idx].dMultiplier)
					return; // No need to check further
				}
			}
		}
	}
}
