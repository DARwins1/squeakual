include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];
const mis_infestedRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];

// Player values
const MIS_CIVS = 1;
const MIS_CYAN_SCAVS = 2;
const MIS_TEAM_CHARLIE = 3;
// Order number for guarding an droid/structure
const DORDER_GUARD = 25;
const MIS_LOST_THRESHOLD = (difficulty >= MEDIUM) ? 2 : 3;

var sensorFound;
var infestedActive;
var depositBeaconActive;
var trucksLost;
var infestedThreatFactor;
var infestedThreatFactorMin;
const MIS_MAX_THREAT = 30;

// Civilian holdout groups
var civGroup1;
var civGroup2;
var civGroup3;
var civGroup4;

// Whether each civilian group has been loaded onto a truck
var civ1Loaded;
var civ2Loaded;
var civ3Loaded;
var civ4Loaded;

// Whether each truck has arrived the deposit zone
var truck1Safe;
var truck2Safe;
var truck3Safe;
var truck4Safe;

//Remove scav helicopters.
camAreaEvent("heliRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("heliRemoveZone", MIS_CYAN_SCAVS);
});

// Setup helicopter attacks.
function heliAttack()
{
	const list = [cTempl.helcan, cTempl.helhmg];
	const ext = {
		limit: [1, 1],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		ignorePlayers: [MIS_CIVS, CAM_INFESTED],
		pos: camMakePos("landingZone")
	};

	// A helicopter will attack the player every 3 minutes.
	// The helicopter attacks stop when the VTOL radar tower is destroyed.
	camSetVtolData(MIS_CYAN_SCAVS, "heliAttackPos", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(2)), "heliTower", ext);
}

// Damage infested stuff
function preDamageInfested()
{
	const structures = enumStruct(CAM_INFESTED);
	for (let i = 0; i < structures.length; ++i)
	{
		// 30% to 60% base HP
		setHealth(structures[i], 30 + camRand(31));
	}

	const units = enumDroid(CAM_INFESTED);
	for (let i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(31));
		}
	}
}

// Damage infested reinforcements
function preDamageInfestedGroup(group)
{
	const units = enumGroup(group);
	for (let i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(31));
		}
	}
}

// Triggered when the player moves towards the haven
camAreaEvent("ambushTrigger", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camManageGroup(camMakeGroup("scavAmbushGroup"), CAM_ORDER_ATTACK, {
			morale: 50,
			fallback: camMakePos("scavBase1"),
			targetPlayer: CAM_HUMAN_PLAYER
		});
		camManageGroup(camMakeGroup("charlieDefenseGroup"), CAM_ORDER_DEFEND, {
			radius: 12,
			pos: camMakePos("charlieDefensePos")
		});
	}
	else
	{
		resetLabel("ambushTrigger", CAM_HUMAN_PLAYER);
	}
});

// Triggered when the player enters the haven's safe zone
camAreaEvent("safeZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Play dialogue, then donate the base to the player
		// TODO: Convert one or more of these dialogue blocks into sequences instead
		camQueueDialogue([
			{text: "CHARLIE: General, team Bravo has arrived at the haven.", delay: 2, sound: CAM_RCLICK},
			{text: "CLAYDE: Right on time.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Commander Charlie, how are the evacuation efforts?", delay: 2, sound: CAM_RCLICK},
			{text: "CHARLIE: We've managed to set up our base in the location you specified, General.", delay: 3, sound: CAM_RCLICK},
			{text: "CHARLIE: Transports with civilians around the sector have been arriving regularly, but...", delay: 3, sound: CAM_RCLICK},
			{text: "CHARLIE: We've detected some groups that have tried to make it here on foot.", delay: 3, sound: CAM_RCLICK},
			{text: "CHARLIE: It seems like they've been pinned down in the hills north of us, sir.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Commander Charlie, grant command of the base to Commander Bravo.", delay: 3, sound: CAM_RCLICK},
			{text: "CHARLIE: Yes, sir!", delay: 3, sound: CAM_RCLICK},
		]);

		hackRemoveMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);

		queue("donateBase", camSecondsToMilliseconds(27));
	}
	else
	{
		resetLabel("safeZone", CAM_HUMAN_PLAYER);
	}
});

function donateBase()
{
	restoreLimboMissionData();

	// Donate all of team Charlie's things in the haven
	const charlieObjects = enumArea("safeZone", MIS_TEAM_CHARLIE, false).filter((obj) => (obj.type === STRUCTURE)).concat(enumDroid(MIS_TEAM_CHARLIE));

	for (const obj of charlieObjects)
	{
		donateObject(obj, CAM_HUMAN_PLAYER);
	}

	// Enable basic base structures for the player
	for (let i = 0; i < camBasicStructs.length; ++i)
	{
		enableStructure(camBasicStructs[i], CAM_HUMAN_PLAYER);
	}

	setPower(playerPower(CAM_HUMAN_PLAYER) + camChangeOnDiff(1000), CAM_HUMAN_PLAYER);

	const lz = getObject("landingZone");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Play more dialogue about saving the civilians, then expand the map
	camQueueDialogue([
		{text: "CLAYDE: Hmm... This complicates matters.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: We shouldn't leave anyone behind, if it can be avoided.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, find the any civilian holdouts in your area, and escort them back to the haven.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Commander Bravo, if I can give a suggestion?", delay: 5, sound: CAM_RCLICK},
		{text: "CHARLIE: Escorting the civilians on foot would be risky.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: We could load the civilians onto the backs of our Trucks instead.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: That way we could just drive the civilians back to the haven ourselves.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: That's... a sound idea, Commander Charlie.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Commander Bravo, bring a truck to each of the civilian holdouts, and then escort the truck back to haven.", delay: 2, sound: CAM_RCLICK},
	]);

	queue("expandMap", camSecondsToMilliseconds(29));

	setTimer("sendCharlieTransport", camMinutesToMilliseconds(2));
}

function sendCharlieTransport()
{
	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZone"), [cTempl.truck],
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 56, y: 61 },
			exit: { x: 56, y: 61 }
		}
	);
}


function expandMap()
{
	// Expand the map to full size
	setScrollLimits(0, 0, 96, 64);

	// Place beacons on each holdout
	hackAddMessage("CIVS1", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS2", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS3", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS4", PROX_MSG, CAM_HUMAN_PLAYER);

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A1L1");
	camSetExtraObjectiveMessage(["Use Trucks to escort civilians back to the haven", "Don't lose " + MIS_LOST_THRESHOLD + " Transport Trucks (0 LOST)"]);

	// Queue the start of the infested waves and scavenger bases
	queue("startInfestedWaves", camSecondsToMilliseconds(60));
	queue("revealEastBase", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("revealWestBase", camChangeOnDiff(camMinutesToMilliseconds(10)))

	// Start some scavenger patrols
	camManageGroup(camMakeGroup("eastPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("eastPatrolPos1"),
			camMakePos("eastPatrolPos2"),
			camMakePos("eastPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(18)
	});
	camManageGroup(camMakeGroup("westPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("westPatrolPos1"),
			camMakePos("westPatrolPos2"),
			camMakePos("westPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(24)
	});

	// Set the mission time
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camMinutesToSeconds(45));
	}
	else
	{
		// Set up scavenger cranes...
		camManageTrucks(MIS_CYAN_SCAVS, {
			label: "eastScavBase",
			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(100)),
			template: cTempl.crane,
			structset: camAreaToStructSet("scavBase1")
		});
		camManageTrucks(MIS_CYAN_SCAVS, {
			label: "westScavBase",
			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(100)),
			template: cTempl.crane,
			structset: camAreaToStructSet("scavBase3")
		});
		if (difficulty >= HARD)
		{
			camManageTrucks(MIS_CYAN_SCAVS, {
				label: "oilOutpost",
				rebuildBase: true,
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(100)),
				template: cTempl.crane,
				structset: camAreaToStructSet("scavBase2")
			});
		}
	}
}

function startInfestedWaves()
{
	infestedActive = true;
	sendInfestedReinforcements();
	setTimer("sendInfestedReinforcements", camSecondsToMilliseconds((difficulty >= MEDIUM) ? 40 : 60));

	// Dialogue about the infested groups along the highway
	camQueueDialogue([
		{text: "CHARLIE: General!", delay: 0, sound: CAM_RCLICK},
		{text: "CHARLIE: We've detected groups of infested moving along the roads nearby!", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Well, then it appears that these Lures really do work after all...", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, try to avoid the Infested if you can.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Focus on escorting those civilians back to the haven.", delay: 5, sound: CAM_RCLICK},
		{text: "CLAYDE: The Infested should be avoidable if you can maintain your distance from them.", delay: 3, sound: CAM_RCLICK},
	]);
}

function revealEastBase()
{
	camDetectEnemyBase("eastScavBase");
}

function revealWestBase()
{
	camDetectEnemyBase("westScavBase");
}

// Triggered when the player moves near Charlie's lone sensor tower
camAreaEvent("sensorZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		sensorFound = true;
		setTimer("donateSensor", camSecondsToMilliseconds(3));
	}
	else
	{
		resetLabel("sensorZone", CAM_HUMAN_PLAYER);
	}
});

function donateSensor()
{
	if (!sensorFound || !infestedActive)
	{
		return;
	}

	removeTimer("donateSensor");

	// Donate all of team Charlie's things in the haven
	const charlieObjects = enumArea("sensorZone", MIS_TEAM_CHARLIE, false).filter((obj) => (obj.type === STRUCTURE));

	for (const obj of charlieObjects)
	{
		// There really should only be one object here...
		donateObject(obj, CAM_HUMAN_PLAYER);
	}

	// Dialogue about the using the sensor to spot the Infested
	camQueueDialogue([
		{text: "CHARLIE: Commander Bravo, we can use Sensor Towers like this one to monitor enemies from a safe distance.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: That'll make it easier to avoid running into the Infested.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Triggered when the player moves into the first civilian holdout
camAreaEvent("civZone1", function(droid)
{
	// Only trigger if the player moves a Truck (NOT engineer) in which isn't already carrying civilians
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup1))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck1", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone1", CAM_HUMAN_PLAYER);
	}
});

function loadTruck1()
{
	const trucks = enumArea("civZone1", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));
	// Abort if there's no longer a truck in the civilian zone
	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone1");
		for (const civ of enumGroup(civGroup1))
		{
			// Move the civs back into their holdout
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		return;
	}
	else
	{
		// Just change the first truck we find into a Transport Truck
		const transTruck = convertToTransport(trucks[0], "civTruck1");

		for (const droid of enumGroup(civGroup1))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				// If we have a simple civilian, remove them quietly
				// (They've "boarded" the truck)
				camSafeRemoveObject(droid);
			}
			else
			{
				// If we have an armed civilian escort, (e.g. a Jeep), tell it to guard the player's transport truck
				orderDroidObj(droid, DORDER_GUARD, transTruck);
			}
		}

		civ1Loaded = true;

		hackRemoveMessage("CIVS1", PROX_MSG, CAM_HUMAN_PLAYER);
		if (!depositBeaconActive)
		{
			hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
			depositBeaconActive = true;
		}
	}
}

camAreaEvent("civZone2", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup2))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck2", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone2", CAM_HUMAN_PLAYER);
	}
});

function loadTruck2()
{
	const trucks = enumArea("civZone2", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));

	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone2");
		for (const civ of enumGroup(civGroup2))
		{
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		return;
	}
	else
	{
		const transTruck = convertToTransport(trucks[0], "civTruck2");

		for (const droid of enumGroup(civGroup2))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				camSafeRemoveObject(droid);
			}
			else
			{
				orderDroidObj(droid, DORDER_GUARD, transTruck);
			}
		}
	}

	civ2Loaded = true;

	hackRemoveMessage("CIVS2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (!depositBeaconActive)
	{
		hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
		depositBeaconActive = true;
	}
}

camAreaEvent("civZone3", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup3))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck3", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone3", CAM_HUMAN_PLAYER);
	}
});

function loadTruck3()
{
	const trucks = enumArea("civZone3", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));

	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone3");
		for (const civ of enumGroup(civGroup3))
		{
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		return;
	}
	else
	{
		const transTruck = convertToTransport(trucks[0], "civTruck3");

		for (const droid of enumGroup(civGroup3))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				camSafeRemoveObject(droid);
			}
			else
			{
				orderDroidObj(droid, DORDER_GUARD, transTruck);
			}
		}
	}

	civ3Loaded = true;

	hackRemoveMessage("CIVS3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (!depositBeaconActive)
	{
		hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
		depositBeaconActive = true;
	}
}

camAreaEvent("civZone4", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroup4))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck4", camSecondsToMilliseconds(3));

	}
	else
	{
		resetLabel("civZone4", CAM_HUMAN_PLAYER);
	}
});

function loadTruck4()
{
	const trucks = enumArea("civZone4", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));

	if (trucks.length == 0)
	{
		const pos = camMakePos("civZone4");
		for (const civ of enumGroup(civGroup4))
		{
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		return;
	}
	else
	{
		const transTruck = convertToTransport(trucks[0], "civTruck4");

		for (const droid of enumGroup(civGroup4))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				camSafeRemoveObject(droid);
			}
			else
			{
				orderDroidObj(droid, DORDER_GUARD, transTruck);
			}
		}
	}

	civ4Loaded = true;

	hackRemoveMessage("CIVS4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (!depositBeaconActive)
	{
		hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
		depositBeaconActive = true;
	}
}

// Replaces the given truck droid with a transport truck
function convertToTransport(truck, transportLabel)
{
	const oldTruckName = truck.name;
	const tBody = truck.body;
	const tProp = truck.propulsion;
	const tPos = camMakePos(truck);

	// Get the un-modified name of this truck
	const standardName = _("Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player hasn't renamed this truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Trans", tBody, tProp)
	}
	else
	{
		// The player has renamed this truck
		// Just slap "Transport" in front of the player's goofy name
		newName = _("Transport") + " " + oldTruckName;
	}

	// Create the new truck
	const newTruck = addDroid(CAM_HUMAN_PLAYER, tPos.x, tPos.y, newName, tBody, tProp, "", "", "Spade1Trans");
	addLabel(newTruck, transportLabel);

	// Quietly remove the old truck...
	camSafeRemoveObject(truck);

	return newTruck;
}

// Triggered when something enters the deposit zone
camAreaEvent("depositZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		const label = getLabel(droid);
		if (camDef(label) && label === "civTruck1")
		{
			truck1Safe = true;
		}
		else if (camDef(label) && label === "civTruck2")
		{
			truck2Safe = true;
		}
		else if (camDef(label) && label === "civTruck3")
		{
			truck3Safe = true;
		}
		else if (camDef(label) && label === "civTruck4")
		{
			truck4Safe = true;
		}

		if (camDef(label))
		{
			infestedThreatFactorMin += 2;
			infestedThreatFactor += 2;

			convertToTruck(droid);

			playSound(cam_sounds.rescue.civilianRescued);
		}
	}
	else if (droid.player === MIS_CIVS)
	{
		if (camDroidMatchesTemplate(droid, cTempl.civ))
		{
			// If we have a normal civilian, just remove it
			camSafeRemoveObject(droid);
		}
	}
	resetLabel("depositZone", ALL_PLAYERS);
});

// Replaces the given transport truck droid with a normal truck
function convertToTruck(transTruck)
{
	const oldTruckName = transTruck.name;
	const tBody = transTruck.body;
	const tProp = transTruck.propulsion;
	const tPos = camMakePos(transTruck);

	// Get the un-modified name of this truck
	const standardName = _("Transport Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player didn't renamed the original truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Mk1", tBody, tProp)
	}
	else
	{
		// The player renamed the original truck.
		// Remove the first instance of "Transport " we find
		const prefix = _("Transport") + " ";
		newName = oldTruckName.slice(prefix.length);
	}

	// Create the new truck
	const newTruck = addDroid(CAM_HUMAN_PLAYER, tPos.x, tPos.y, newName, tBody, tProp, "", "", "Spade1Mk1");

	// Quietly remove the transport truck...
	camSafeRemoveObject(transTruck);
}

// Activate the eastern factory
function camEnemyBaseDetected_eastScavBase()
{
	camEnableFactory("scavFactory1");

	// Dialogue
	camQueueDialogue([
		{text: "CHARLIE: General! We've detected some hostile scavengers that have set up near our base.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Ignore them if possible, Commanders.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: But if they interfere with our objective, you are authorized to clear them out.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Just get as many of those civilians back as you can.", delay: 5, sound: CAM_RCLICK},
	]);
}

// Activate the western factory and VTOL tower
function camEnemyBaseDetected_westScavBase()
{
	camEnableFactory("scavFactory2");
	queue("heliAttack", camChangeOnDiff(camSecondsToMilliseconds(70)));
}

// Off-map infested reinforcements from the north, bearing south.
// As the infested threat level rises, the infested groups become more dangerous.
function sendInfestedReinforcements()
{
	// Divide infested templates based on spiciness...
	const fodderTemplates = [cTempl.infciv]; // Infested Civilians only
	const mildTemplates = [ // Light vehicles and infantry
		cTempl.infbuggy, cTempl.infrbuggy, cTempl.inftrike, cTempl.infbjeep, cTempl.infrbjeep, 
		cTempl.infbloke, cTempl.inflance, cTempl.infkevbloke, cTempl.infkevlance,
	];
	const spicyTemplates = [ // Large vehicles + Stingers
		cTempl.infbuscan, cTempl.inffiretruck, cTempl.infminitruck, cTempl.infsartruck,
		cTempl.stinger,
	];
	const hotTemplates = [ // Bus tanks + Vile Stingers
		cTempl.infmoncan, cTempl.infmonhmg, cTempl.infmonmrl, cTempl.infmonsar,
		cTempl.vilestinger,
	];

	const droids = [];
	const NUM_DROIDS = 8 + Math.floor(infestedThreatFactor / 4);
	for (let i = 0; i < NUM_DROIDS; i++)
	{
		const RAND_NUM = camRand(11) + infestedThreatFactor - 5;
		// Choose a random number that is infestedThreatFactor +/- 5.
		// Then we add template to the Infested group based on the number chosen.
		// The templates chosen based on the following rules:
		// If [0:7], choose from the "fodder" templates (which is just one template lol)
		// If [8:14], choose from the "mild" templates
		// If [15:24], choose from the "spicy" templates
		// If >25, choose from the "hot" templates
		// As the threat factor rises, this will choose larger and larger numbers, which in
		// turn add more threatening units to the Infested groups. 

		if (RAND_NUM <= 7)
		{
			droids.push(fodderTemplates[camRand(fodderTemplates.length)]);
		}
		else if (RAND_NUM >= 8 && RAND_NUM <= 14)
		{
			droids.push(mildTemplates[camRand(mildTemplates.length)]);
		}
		else if (RAND_NUM >= 15 && RAND_NUM <= 24)
		{
			droids.push(spicyTemplates[camRand(spicyTemplates.length)]);
		}
		else
		{
			droids.push(hotTemplates[camRand(hotTemplates.length)]);
		}
	}

	// Choose one of the entrances to spawn from
	if (camRand(2) == 0)
	{
		// East entrance
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), droids, CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_DEFEND, data: {pos: camMakePos("infExit"), radius: 0}}
		));
	}
	else
	{
		// West entrance
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), droids, CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_DEFEND, data: {pos: camMakePos("infExit"), radius: 0}}
		));
	}

	// Decrease the threat factor over time if it's above the minimum
	if (infestedThreatFactor > infestedThreatFactorMin)
	{
		infestedThreatFactor--;
	}
}

// Remove infested units once they reach the end of the road
camAreaEvent("infExit", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		const droids = enumArea("infExit", CAM_INFESTED, false);
		for (droid of droids)
		{
			camSafeRemoveObject(droid);
		}
	}
	resetLabel("infExit", CAM_INFESTED);
});

function eventAttacked(victim, attacker)
{
	if (victim.player === CAM_INFESTED && attacker.player === CAM_HUMAN_PLAYER && victim.group !== null)
	{
		if (camGetGroupOrder(victim.group) === CAM_ORDER_DEFEND)
		{
			// The player has attacked one of the meandering Infested groups
			// Re-order the Infested group to attack the player instead
			camManageGroup(victim.group, CAM_ORDER_ATTACK, {
				targetPlayer: CAM_HUMAN_PLAYER,
				ignorePlayers: MIS_CIVS,
				pos: camMakePos("landingZone")
			});

			// Increase the spiciness of future Infested waves
			infestedThreatFactor += difficulty;
			if (infestedThreatFactor > MIS_MAX_THREAT)
			{
				// Cap the threat factor so the player doesn't fall into a feedback loop
				infestedThreatFactor = MIS_MAX_THREAT;
			}
		}
	}
}

// Drop off civilians at the haven
function eventTransporterLanded(transport)
{
	// Count all Charlie units
	const units = enumDroid(MIS_TEAM_CHARLIE);

	for (droid of units)
	{
		if (!camIsTransporter(droid))
		{
			camSafeRemoveObject(droid);
		}
	}

	// Add some civilians to the LZ
	const NUM_CIVS = camRand(5) + 6; // 6 to 10 civilians
	const spawnPos = camMakePos("landingZone");
	const depositPos = camMakePos("depositZone");
	for (let i = 0; i < NUM_CIVS; i++)
	{
		// Spawn civilians, and then move them towards the deposit zone
		const civ = addDroid(MIS_CIVS, spawnPos.x, spawnPos.y, _("Civilian"), "CivilianBody", "BaBaLegs", "", "", "InfestedMelee");
		orderDroidLoc(civ, DORDER_MOVE, depositPos.x, depositPos.y);
	}
}

function eventDestroyed(obj)
{
	if (obj.type === DROID && obj.player === CAM_HUMAN_PLAYER && obj.droidType === DROID_CONSTRUCT)
	{
		const label = getLabel(obj);
		if (!camDef(label))
		{
			return; // Don't care
		}

		if (label === "civTruck1" && !truck1Safe)
		{
			// Transport Truck destroyed before reaching the deposit zone
			trucksLost++;
		}
		if (label === "civTruck2" && !truck2Safe)
		{
			trucksLost++;
		}
		if (label === "civTruck3" && !truck3Safe)
		{
			trucksLost++;
		}
		if (label === "civTruck4" && !truck4Safe)
		{
			trucksLost++;
		}

		if (getObject("civTruck1") === null && getObject("civTruck2") === null
		&& getObject("civTruck3") === null && getObject("civTruck4") === null) 
		{
			// If there are no transport trucks active, remove the deposit beacon
			hackRemoveMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
			depositBeaconActive = false;
		}

		// Update the objective message
		camSetExtraObjectiveMessage(
			["Use Trucks to escort civilians back to the haven",
				"Don't lose " + MIS_LOST_THRESHOLD + " Transport Trucks (" + trucksLost + " LOST)"]
		);

		checkCivsDone();
	}
}

// Check if all civs are accounted for and the mission can move into its final phase
function checkCivsDone()
{
	// Allow the player to move on if:
	// The player has not lost too many Transport Trucks
	// The player has loaded all civilians into Transport Trucks
	// The player does not currently have any Transport Trucks
	if (trucksLost < MIS_LOST_THRESHOLD 
		&& civ1Loaded && civ2Loaded && civ3Loaded && civ4Loaded
		&& getObject("civTruck1") === null && getObject("civTruck2") === null
		&& getObject("civTruck3") === null && getObject("civTruck4") === null)
	{
		if (!tweakOptions.rec_timerlessMode)
		{
			setMissionTime(camMinutesToSeconds(5));
		}

		// Tell the player to hunker down in the haven
		camQueueDialogue([
			{text: "CHARLIE: General Clayde, team Bravo has escorted as many civilians as they can.", delay: 2, sound: CAM_RCLICK},
			{text: "CLAYDE: Well done, Commander Bravo.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Now, take all of your forces, and fall back to the safe haven as quickly as possible.", delay: 4, sound: CAM_RCLICK},
			{text: "CHARLIE: You heard the man, Bravo.", delay: 8, sound: CAM_RCLICK},
			{text: "CHARLIE: Bring your guys back home!", delay: 2, sound: CAM_RCLICK},
		]);

		setTimer("checkHaven", camSecondsToMilliseconds(2));
		removeTimer("sendCharlieTransport");

		// Re-place a beacon in Charlie's safe haven
		hackAddMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);
	}
}

// Check if all the player's units are within the safe haven
function checkHaven()
{
	const safeDroids = enumArea("safeZone", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID
	));
	const allDroids = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID
	));

	if (safeDroids.length === allDroids.length)
	{
		// All of the player's units are in the haven!
		removeTimer("checkHaven");
		removeTimer("sendInfestedReinforcements");

		// Shrink the map boundaries again
		setScrollLimits(39, 42, 78, 63);

		// Dialogue...
		camQueueDialogue([
			{text: "CHARLIE: General, team Bravo has returned to the haven.", delay: 2, sound: CAM_RCLICK},
			{text: "CHARLIE: What are our-", delay: 3, sound: CAM_RCLICK},
		]);

		queue("nukeMap", camSecondsToMilliseconds(6));

		camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A1L1");
		setMissionTime(-1);

		hackRemoveMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);
	}
}

// Blow up everything on the map that's not in the safe haven
function nukeMap()
{
	// Remove the base in the rare event an auto-explosion triggers as we nuke the base here.
	camSetEnemyBases({});
	const nukedObjs = enumArea(0, 0, mapWidth, mapHeight, ALL_PLAYERS, false);
	const safeObjs = enumArea("safeZone", ALL_PLAYERS, false).filter((obj) => (!(obj.type === DROID && isVTOL(obj))));
	let foundUnit = false;

	for (let i = 0, len = nukedObjs.length; i < len; ++i)
	{
		let nukeIt = true;
		const obj1 = nukedObjs[i];

		// Check if it's in the safe area.
		for (let j = 0, len2 = safeObjs.length; j < len2; ++j)
		{
			const obj2 = safeObjs[j];

			if (obj1.id === obj2.id)
			{
				nukeIt = false;
				break;
			}
		}

		if (nukeIt && obj1 !== null && obj1.id !== 0)
		{
			// Kaboom!
			camSafeRemoveObject(obj1, true);
		}
	}

	// Make a big explosion south of the haven
	fireWeaponAtLoc("LargeExplosion", 34, 62, CAM_HUMAN_PLAYER);

	// Adjust the lighting
	setSunPosition(0, -0.2, 0.3);
	setSunIntensity(0.7, 0.5, 0.5, 1.4, 0.6, 0.6, 1.4, 0.6, 0.6);

	// Set the fog to it's default colours
	camSetFog(182, 225, 236);

	// End-mission dialogue
	camQueueDialogue([
		{text: "CHARLIE: WOAH!", delay: 1, sound: CAM_RCLICK},
		{text: "CLAYDE: And THAT, means we're done in this sector.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: And what about Commander Alpha?", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Alpha is dead.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: The Infested have been eradicated.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: There's nothing left here but smoldering ruins.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: If it's all gone...", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: Then what was the point in all of this?", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: ...We may have have been set back today.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: But.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: This operation was not in vain.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Before the traitors of team Alpha were atomized...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We were able to pull all the data from the NASDA site that they had set up around.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: And I believe we may have found something even more important than any warhead or secret weapon.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: ...Commanders Bravo and Charlie, make preparations for transport by the end of the day.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: I believe our next operation is about to begin...", delay: 3, sound: CAM_RCLICK},
	]);

	// Used to allow the player to bring prologue units into A1L1
	camCompleteRequiredResearch(["R-Script-ProloguePlayed"], CAM_HUMAN_PLAYER);
	setReticuleFlash(2, false);

	// End the mission after the dialogue is finished
	queue("camScriptedVictory", camSecondsToMilliseconds(52));
}

function checkTrucksLost()
{
	if (trucksLost < MIS_LOST_THRESHOLD)
	{
		return undefined;
	}
	else
	{
		// Player has lost too many Transport Trucks
		return false;
	}
}

function eventStartLevel()
{
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_CYAN_SCAVS, (PLAYER_COLOR !== 7) ? 7 : 0); // Scavs to cyan or green
	// All other factions should retain their color from the previous mission

	// The player only loses if they run out of units
	camSetStandardWinLossConditions(CAM_VICTORY_TIMEOUT, "A1L1", {reinforcements: -1});

	// Set alliances
	setAlliance(MIS_CIVS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIVS, MIS_TEAM_CHARLIE, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_CHARLIE, true);

	const startpos = getObject("playerEntry");
	centreView(startpos.x, startpos.y);

	// Place the droids from the previous mission
	setNoGoArea(startpos.x, startpos.y, startpos.x2, startpos.y2, ALL_PLAYERS);

	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED);
	camCompleteRequiredResearch(mis_scavResearch, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(camRec2StartResearch, MIS_CIVS);
	camCompleteRequiredResearch(camRec2StartResearch, MIS_TEAM_CHARLIE);

	// Set up bases
	camSetEnemyBases({
		"eastScavBase": {
			cleanup: "scavBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"oilOutpost": {
			cleanup: "scavBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"westScavBase": {
			cleanup: "scavBase3",
			detectMsg: "SCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
	});

	// Set up factories
	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 7,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			data: {
				targetPlayer: CAM_HUMAN_PLAYER, // Prioritize the player's main base
				ignorePlayers: MIS_CIVS, // Ignore civilians if possible
				targetPos: camMakePos("landingZone"),
				// regroup: true
			},
			// Infantry, light vehicles, with the occasional bus tank
			templates: [
				cTempl.monhmg, cTempl.kevbloke, cTempl.bjeep, cTempl.kevlance, cTempl.kevbloke, cTempl.kevbloke, cTempl.bjeep,
				cTempl.rbjeep, cTempl.kevlance, cTempl.kevbloke, cTempl.minitruck
			]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				ignorePlayers: MIS_CIVS,
				targetPos: camMakePos("landingZone")
			},
			// Mostly vehicles
			templates: [
				cTempl.firetruck, cTempl.bjeep, cTempl.kevlance, cTempl.buscan, cTempl.minitruck,
				cTempl.sartruck, cTempl.rbjeep, cTempl.bjeep, cTempl.bjeep, cTempl.firetruck
			]
		},
	});

	camSetArtifacts({
		"scavFactory1": { tech: "R-Wpn-Rocket-LtA-TMk1" }, // Sarissa
	});

	// Place a beacon in Charlie's safe haven
	hackAddMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);

	// All Infested structures start out partially damaged
	preDamageInfested(); // TODO: ARE there any structures???

	setMissionTime(-1);

	sensorFound = false;
	infestedActive = false;
	depositBeaconActive = false;
	truck1Safe = false;
	truck2Safe = false;
	truck3Safe = false;
	truck4Safe = false;
	trucksLost = 0;
	civGroup1 = camNewGroup();
	civGroup2 = camNewGroup();
	civGroup3 = camNewGroup();
	civGroup4 = camNewGroup();
	infestedThreatFactor = 5;
	infestedThreatFactorMin = 5;

	// Populate the civilian holdouts
	const civ1Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.bjeep,
	];
	const civ2Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.bjeep, cTempl.bjeep,
		cTempl.buscan,
	];
	const civ3Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.buggy, cTempl.buggy, cTempl.trike,
		cTempl.firetruck,
	];
	const civ4Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.bjeep, cTempl.bjeep, cTempl.bjeep,
		cTempl.moncan,
	];
	const templateLists = [civ1Templates, civ2Templates, civ3Templates, civ4Templates];
	const civZones = ["civZone1", "civZone2", "civZone3", "civZone4"];
	const civGroups = [civGroup1, civGroup2, civGroup3, civGroup4];
	for (let i = 0; i < 4; i++)
	{
		const templates = templateLists[i];
		const zone = getObject(civZones[i]);
		const civGroup = civGroups[i];

		for (template of templates)
		{
			// Choose a random position within the zone
			const pos = {x: zone.x + camRand(zone.x2 - zone.x), y: zone.y + camRand(zone.y2 - zone.y)};

			// Make some clean-looking names for the spawned units
			// ("Weapon Body Propulsion" doesn't look very good for scavenger units)
			let droidName = "";
			switch (template.body)
			{
				case "CivilianBody": 
					droidName = _("Civilian");
					break;
				case "B2JeepBody": 
					droidName = _("Jeep");
					break;
				case "B4body-sml-trike01": 
					droidName = _("Trike");
					break;
				case "B3body-sml-buggy01": 
					droidName = _("Buggy");
					break;
				case "BusBody": 
					droidName = _("School Bus");
					break;
				case "FireBody": 
					droidName = _("Fire Truck");
					break;
				case "MonsterBus": 
					droidName = _("Big Bertha");
					break;
			}

			const newDroid = addDroid(MIS_CIVS, pos.x, pos.y, droidName, template.body, template.prop, "", "", template.weap);
			groupAdd(civGroup, newDroid);
		}
	}

	// Shrink the map temporarily
	setScrollLimits(42, 40, 96, 64);

	// HACK: Remove any player structures that are on the map
	for (struct of enumStruct(CAM_HUMAN_PLAYER))
	{
		camSafeRemoveObject(struct);
	}

	camAutoReplaceObjectLabel("heliTower");

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "CLAYDE: Commander Bravo, excellent work on securing the town.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: I would like to introduce you to my Lieutenant.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: He has been reviewing the numerous devices and documents that you have helped recover from the previous mission.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Greetings, Commander Bravo.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It seems that the device that you found within the town was a sort of \"lure\" for the infested.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The device sends out a signal that can be detected from miles away, and draws the infested towards it.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It appears that the scavengers who had set up fortifications in the town had inadvertently activated the Lure.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: And, well...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Yes, I think we can all guess what happened to them.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Lieutenant, do we know why this device was in that town in the first place?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Yes, sir. It would appear that some of our suspicions were correct.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We're still reviewing the material brought back from the town, but...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: But what, Lieutenant?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Uh, we recovered a plethora of documents from the town that confirm that these Lures pre-date the Collapse.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We're now certain that both the items we've found and the Infested themselves are all part of a Pre-Collapse weapons program.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: This appears to the culmination of the top-secret \"Project X\" program.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: ...I see.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: These Project X items we recovered were brought from a local laboratory.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: After arriving in that town, they were to be discreetly shipped to a distant military site.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But then there was the Collapse.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: And instead, these items were left here collecting dust for years.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: ...What else have we found in that town, Lieutenant?", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Well, we've recovered at least 3 functional Lures.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Among the documents, there also appears to be schematics for the Lures themselves.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: And, there's these large capsule-like containers...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But we have yet to identify what could be inside.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Understood. Continue your work, Lieutenant.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Yes, sir!", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, continue making your way to team Charlie's haven.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Once you arrive, assist them in any way you can with their objective.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Meanwhile, I believe we now have the solution to our infestation problem...", delay: 3, sound: CAM_RCLICK},
	]);
}
