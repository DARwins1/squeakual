include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/structSets.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage06", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage06", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage06", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals05", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Sys-Engineering02", "R-Cyborg-Metals05",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF02",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine06", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade01", "R-Sys-Sensor-Upgrade01",
	"R-Vehicle-Armor-Heat02", "R-Cyborg-Armor-Heat02", "R-Wpn-Howitzer-Damage02",
	"R-Wpn-Howitzer-ROF02", "R-Wpn-Howitzer-Accuracy01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];
const mis_deltaExtraResearch = [ // Added on top of everything the player starts Act 4 with
	"R-Wpn-Cannon-Damage06", "R-Wpn-Cannon-ROF03", "R-Wpn-AAGun-ROF02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Howitzer-ROF02", "R-Struc-RprFac-Upgrade03",
	"R-Struc-VTOLPad-Upgrade03",
];

const MIS_UPLINK = 1;
const MIS_TEAM_DELTA = 5;
const MIS_DELTA_RANK = (difficulty <= MEDIUM) ? 6 : difficulty + 4; // Elite to Hero
const MIS_DELTA_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(6));

var colCommanderGroup;
var colKillGroup;
var deltaCommander;
var deltaCommandGroup;

var deltaTruckJob1;
var deltaTruckJob2;
var deltaTruckJob3;
var deltaTruckJob4;
var deltaTruckJob5;
var deltaTruckJob6;
var deltaTruckJob7;
var deltaTruckJob8;
var deltaTruckJob9;

var allowExtraWaves;
var deltaCommanderDeathTime;
var deltaDetected;
var deltaActive;
var deltaAggro;
var uplinkTimeRemaining;
var uplinkSecure;
var lastUplinkCheckTime;
var missionTimeRemaining;

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);
	
	// HEAP Bombs, Tank Killers, and Thermite Bombs
	const templates = [cTempl.comhbombv, cTempl.comhatv, cTempl.comthermv];
	const ext = {
		limit: [2, 3, 2],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "colCC", ext);
}

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, "vtolRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(45)), undefined, ext);
}

// Assign a label to the Collective's sensor droid
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comsenst))
	{
		addLabel(droid, "colSensor");
	}
}

function eventDestroyed(obj)
{
	if (obj.player === MIS_TEAM_DELTA && obj.type === DROID && obj.droidType === DROID_COMMAND)
	{
		// Mark the time that the commander died
		deltaCommanderDeathTime = gameTime;
	}
}

function sendInfestedReinforcements()
{	
	const coreDroids = [
		[ // Scavs & crawlers
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg,
			cTempl.infmonmrl,
			cTempl.infmonlan,
			cTempl.infflatmrl, cTempl.infflatmrl, // Flatbeds
			cTempl.infflatat,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, cTempl.infcybhg, cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybla, cTempl.infcybla, // Lancers
			cTempl.infscymc, // Super Heavy Gunners
			cTempl.infcybfl, // Flamers
			cTempl.infcolpodt, cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolaaht, // Hurricanes
			cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infcohhcant, // Heavy Cannon
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= EASY) ? cTempl.infcohhrat : undefined), // Add a HRA tank
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.infcomtruckt, // Infested Truck
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= MEDIUM) ? cTempl.infcomhaat : undefined), // Add a Cyclone tank
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;

	// Southeast road entrance
	// Only if either factory is alive
	if (getObject("infFactory1") !== null || getObject("infFactory2") !== null)
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}

	// South hill entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	if (allowExtraWaves)
	{
		// South base entrance
		camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		// South marsh entrance
		camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		// Southeast road entrance
		// Only if the ridge factory is alive
		if (getObject("infFactory6") !== null)
		{
			camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
		}
	}
}

// Send in allied forces if the player has cleared enough of the defensive structures
function sendDeltaTransporter()
{
	if (camBaseIsEliminated("deltaLZBase"))
	{
		// LZ destroyed; try again later
		return;
	}

	// Make a list of droids to bring in in order of importance:
	// Trucks -> Commander -> Command Group -> VTOLs
	let droidQueue = [];

	// Python trucks on Hard+
	const tTemplate = (difficulty < HARD) ? cTempl.plmtruckt : cTempl.plhtruckt;

	if (!camDef(camGetTruck(deltaTruckJob1))) droidQueue.push(tTemplate);
	if (!camDef(camGetTruck(deltaTruckJob2))) droidQueue.push(tTemplate);
	if (!camDef(camGetTruck(deltaTruckJob3))) droidQueue.push(tTemplate);
	if (!camDef(camGetTruck(deltaTruckJob4))) droidQueue.push(tTemplate);
	if (deltaActive && (camAreaSecure("overlookStructArea", MIS_TEAM_DELTA) || !camBaseIsEliminated("deltaOverlookBase"))) 
	{
		if (!camDef(camGetTruck(deltaTruckJob5))) droidQueue.push(tTemplate);
	}
	if (deltaActive && (camAreaSecure("outpostStructArea", MIS_TEAM_DELTA) || !camBaseIsEliminated("deltaOutpost"))) 
	{
		if (!camDef(camGetTruck(deltaTruckJob6))) droidQueue.push(tTemplate);
	}
	if (deltaActive && (camAreaSecure("outpostStructArea", MIS_TEAM_DELTA) || !camBaseIsEliminated("deltaOutpost"))) 
	{
		if (!camDef(camGetTruck(deltaTruckJob7))) droidQueue.push(tTemplate);
	}
	if (deltaActive && (camAreaSecure("uplinkStructArea", MIS_TEAM_DELTA) || !camBaseIsEliminated("deltaUplinkBase"))) 
	{
		if (!camDef(camGetTruck(deltaTruckJob8))) droidQueue.push(tTemplate);
	}
	if (deltaActive && (camAreaSecure("uplinkStructArea", MIS_TEAM_DELTA) || !camBaseIsEliminated("deltaUplinkBase"))) 
	{
		if (!camDef(camGetTruck(deltaTruckJob9))) droidQueue.push(tTemplate);
	}

	// Delay when Delta's commander can be rebuilt
	if (gameTime >= deltaCommanderDeathTime + MIS_DELTA_COMMANDER_DELAY)
	{
		// Bring in a new commander if needed
		droidQueue = droidQueue.concat(camGetRefillableGroupTemplates(deltaCommander));
	}

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([deltaCommandGroup, deltaVtolSensGroup, deltaVtolCbGroup, deltaVtolTowerGroup1]));

	// Check if the corresponding VTOL tower exists before resupplying...
	if (getObject("deltaVtolTower2"))
	{
		droidQueue = droidQueue.concat(camGetRefillableGroupTemplates(deltaVtolTowerGroup2));
	}
	if (getObject("deltaVtolTower3"))
	{
		droidQueue = droidQueue.concat(camGetRefillableGroupTemplates(deltaVtolTowerGroup3));
	}

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_DELTA, camMakePos("landingZoneDelta"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryDelta"),
				exit: camMakePos("transportEntryDelta"),
				silent: !deltaDetected
			}
		);
	}
}

function eventTransporterLanded(transport)
{
	if (transport.player !== MIS_TEAM_DELTA)
	{
		return;
	}

	const transDroids = camGetTransporterDroids(transport.player);
	const truckJobs = [deltaTruckJob1, deltaTruckJob2, deltaTruckJob3, deltaTruckJob4, deltaTruckJob5, deltaTruckJob6, deltaTruckJob7, deltaTruckJob8, deltaTruckJob9];
	const otherGroups = [deltaCommander, deltaCommandGroup, deltaVtolSensGroup, deltaVtolCbGroup, deltaVtolTowerGroup1];

	const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
	const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

	// Assign any trucks
	let truckIndex = 0;
	for (const job of truckJobs)
	{
		// Check if we have an open job and an available truck
		if (!camDef(camGetTruck(job)) && camDef(transTrucks[truckIndex]))
		{
			// Assign this truck!
			camAssignTruck(transTrucks[truckIndex], job);
			truckIndex++;
		}
	}

	// Next, check if any new commander/sensor unit has landed
	// If so, apply the appropriate label
	for (const droid of transOther)
	{
		if (droid.droidType === DROID_COMMAND)
		{
			// New Delta command tank
			addLabel(droid, "deltaCommander");
			// Also rank the commander to the appropriate level
			camSetDroidRank(getObject("deltaCommander"), MIS_DELTA_RANK);
		}
		else if (droid.droidType === DROID_SENSOR)
		{
			// New Delta sensor tank
			addLabel(droid, "deltaVtolSensor");
		}
	}

	// Assign other units to their refillable groups
	camAssignToRefillableGroups(transOther, otherGroups);
}

function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player === MIS_TEAM_DELTA && attacker.player === CAM_HUMAN_PLAYER)
	{
		detectDelta();
	}
}

function detectDelta()
{
	if (deltaDetected)
	{
		return;
	}

	// TODO: Dialogue...

	deltaDetected = true;
}

// Activate everything
function camEnemyBaseEliminated_colUplinkBase()
{
	activateMoreFactories();
	activateTeamDelta();

	camEnableFactory("colFactory2");
	camEnableFactory("colCybFactory1");

	// Make the Collective commander attack the player (if it's still alive)
	camManageGroup(colCommanderGroup, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		repair: 65
	})
}

// Activate some factories, and move the Collective's kill group against the Infested
function infestedBattle()
{
	camEnableFactory("colFactory3");
	camEnableFactory("colCybFactory3");
	camEnableFactory("colCybFactory4");
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("infFactory3");

	camManageGroup(colKillGroup, CAM_ORDER_COMPROMISE, {
		targetPlayer: CAM_INFESTED,
		pos: camMakePos("infRoadStructs"),
		regroup: true,
		count: -1
	});

	heliAttack();
}

// Activate some more factories and allow the Infested to bring in more groups
function activateMoreFactories()
{
	camEnableFactory("colFactory1");
	camEnableFactory("colCybFactory2");
	camEnableFactory("infFactory4");
	camEnableFactory("infFactory5");
	camEnableFactory("infFactory6");
	camEnableFactory("infHvyFactory");
	camEnableFactory("infCybFactory");

	allowExtraWaves = true;
}

// Allow team Delta to start expanding and moving towards the Uplink
function activateTeamDelta()
{
	if (deltaActive)
	{
		return;
	}

	deltaActive = true;

	// Move to capture the uplink
	camManageGroup(deltaCommander, CAM_ORDER_ATTACK, {
		repair: 50,
		removable: false,
		pos: [
			camMakePos("outpostStructArea"),
			camMakePos("uplinkStructArea")
		],
		radius: 20
	});
	camManageGroup(deltaCommandGroup, CAM_ORDER_FOLLOW, {
		leader: "deltaCommander",
		repair: 50,
		suborder: CAM_ORDER_COMPROMISE,
		removable: false,
		data: {
			pos: [
				camMakePos("uplinkStructArea")
			],
			radius: 20
		}
	});
}

// Make team Delta's commander more aggressive against the player 
function aggroTeamDelta()
{
	if (deltaAggro)
	{
		return;
	}

	detectDelta();
	deltaAggro = true;

	// TODO: Dialogue...

	// Attack the player directly
	camManageGroup(deltaCommander, CAM_ORDER_ATTACK, {
		repair: 50,
		removable: false,
		targetPlayer: CAM_HUMAN_PLAYER
	});
}

// Returns true the uplink has been held by the player for long enough
// Returns false if the Uplink is destroyed
function dataDownloaded()
{
	if (uplinkTimeRemaining <= 0)
	{
		if (uplinkSecure && !tweakOptions.rec_timerlessMode)
		{
			setMissionTime(missionTimeRemaining); // Resume the mission timer
		}
		if (uplinkSecure)
		{
			playSound(cam_sounds.primObjectiveCompleted);
			updateExtraObjectiveMessage();
			uplinkSecure = false;
		}

		// Player can leave
		return true;
	}

	// TODO: Alternate win condition if all enemies are dead

	// Fail if Uplink is destroyed
	if (enumStruct(MIS_UPLINK).length == 0)
	{
		return false;
	}

	// Otherwise, update the time remaining if the uplink is held by the player
	if (camBaseIsEliminated("colUplinkBase") && camBaseIsEliminated("deltaUplinkBase") 
		&& camAreaSecure("uplinkStructArea") && enumArea("uplinkStructArea", CAM_HUMAN_PLAYER, false).length > 0)
	{
		// If the uplink was secure the last time we checked, update the time remaining
		if (uplinkSecure)
		{
			uplinkTimeRemaining -= gameTime - lastUplinkCheckTime;
			updateExtraObjectiveMessage();
		}
		else
		{
			// Remove the uplink blip and mission timer
			hackRemoveMessage("UPLINK_BEACON", PROX_MSG, CAM_HUMAN_PLAYER);
			if (!tweakOptions.rec_timerlessMode)
			{
				missionTimeRemaining = getMissionTime();
				setMissionTime(-1); // Pause the mission timer
			}
			playSound(cam_sounds.objectiveCaptured);
		}

		lastUplinkCheckTime = gameTime;
		uplinkSecure = true;

		if (lastUplinkCheckTime < camMinutesToMilliseconds(7))
		{
			// Make Delta more aggresive if the player is winning
			aggroTeamDelta();
		}
	}
	else // Uplink not secure
	{
		if (uplinkSecure)
		{
			// Player lost control of the uplink
			hackAddMessage("UPLINK_BEACON", PROX_MSG, CAM_HUMAN_PLAYER);
			if (!tweakOptions.rec_timerlessMode)
			{
				setMissionTime(missionTimeRemaining); // Resume the mission timer
			}
		}

		lastUplinkCheckTime = gameTime;
		uplinkSecure = false;
	}
}

// Update the objective message with the accurate time remaining
function updateExtraObjectiveMessage()
{
	if (uplinkTimeRemaining > 0)
	{
		let displayMinutes = Math.trunc(uplinkTimeRemaining / 1000 / 60);
		let displaySeconds = (uplinkTimeRemaining / 1000) % 60;
		// Put a 0 in front of the time if it has only 1 digit.
		if (displaySeconds < 10)
		{
			displaySeconds = "0" + displaySeconds;
		}

		camSetExtraObjectiveMessage(_("Secure and hold the satellite uplink station") + " (" + displayMinutes + ":" + displaySeconds + " remaining)");
	}
	else
	{
		camSetExtraObjectiveMessage();
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = camMakePos("transportEntry");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A4L3", {
		// message: "RET_LZ",
		reinforcements: camMinutesToSeconds(2),
		area: "compromiseZone",
		callback: "dataDownloaded",
		enableLastAttack: false,
		ignoreInfestedUnits: true
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_collectiveResearch, MIS_UPLINK);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(camAct4StartResearch, MIS_TEAM_DELTA);
	camCompleteRequiredResearch(mis_deltaExtraResearch, MIS_TEAM_DELTA);

	setAlliance(MIS_UPLINK, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_UPLINK, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_UPLINK, CAM_INFESTED, true);
	setAlliance(MIS_UPLINK, MIS_TEAM_DELTA, true);

	changePlayerColour(MIS_UPLINK, 10); // Change the Uplink to white
	changePlayerColour(MIS_TEAM_DELTA, (playerData[0].colour !== 1) ? 1 : 8); // Delta to orange or yellow

	camSetArtifacts({
		"colAAEmp": { tech: "R-Wpn-AAGun04" }, // Whirlwind AA
		"colResearch": { tech: "R-Wpn-Bomb04" }, // Thermite Bomb Bay
	});

	camSetEnemyBases({
		"deltaLZBase": {
			cleanup: "deltaLZStructs",
			detectMsg: "DELTA_LZ",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colNorthEastBase": {
			cleanup: "colNEStructs",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colHillBase": {
			cleanup: "colEastHillStructs",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colUplinkBase": {
			cleanup: "uplinkStructArea",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE,
		},
		"colOutpost": {
			cleanup: "outpostStructArea",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE,
		},
		"colWestCyborgBase": {
			cleanup: "colWestStructs",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colMainStructs",
			detectMsg: "COL_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infRoadBase": {
			cleanup: "infRoadStructs",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infHillBase": {
			cleanup: "infHillStructs",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infRidgeBase": {
			cleanup: "infRidgeStructs",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infCollectiveBase": {
			cleanup: "infColBaseStructs",
			detectMsg: "INF_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infMarshBase": {
			cleanup: "infMarshStructs",
			detectMsg: "INF_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEdgeBase": {
			cleanup: "infEdgeStructs",
			detectMsg: "INF_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		// These bases start unbuilt
		"deltaOverlookBase": {
			cleanup: "overlookStructArea",
			detectMsg: "DELTA_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"deltaOutpost": {
			cleanup: "outpostStructArea",
			detectMsg: "DELTA_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_DELTA,
		},
		"deltaUplinkBase": {
			cleanup: "uplinkStructArea",
			detectMsg: "DELTA_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_DELTA,
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			// Heavy/medium tanks
			templates: [ cTempl.cohhcant, cTempl.comhaat, cTempl.comhatt, cTempl.cohhcant, cTempl.comhaat ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_PATROL,
			data: {
				repair: 70,
				interval: camChangeOnDiff(camSecondsToMilliseconds(24)),
				pos: [
					camMakePos("hoverPatrolPos1"),
					camMakePos("hoverPatrolPos2"),
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos4"),
				]
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(100)),
			// Hovers
			templates: [ cTempl.cohhrah, cTempl.cohhcant, cTempl.comhpvh, cTempl.comhath, cTempl.combbh ]
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_INFESTED,
				repair: 45
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Medium tanks
			templates: [ cTempl.comagt, cTempl.comacant, cTempl.comagt, cTempl.cominft, cTempl.comacant ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			// Oops! All Supers!!
			templates: [ cTempl.scytk, cTempl.scyac ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			// Assault Gunners + Super Grenadiers
			templates: [ cTempl.cybag, cTempl.scygr ]
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_INFESTED,
				repair: 35
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			// Lancers + Super Auto Cannon 
			templates: [ cTempl.cybla, cTempl.scyac, cTempl.cybla ]
		},
		"colCybFactory4": {
			assembly: "colCybAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_INFESTED,
				repair: 45
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Assault Gunners + Thermite Flamers
			templates: [ cTempl.cybag, cTempl.cybth ]
		},
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infkevbloke, cTempl.inftrike, cTempl.infkevlance, cTempl.inffiretruck, cTempl.infmoncan ]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infbuscan, cTempl.infbuggy, cTempl.infrbuggy, cTempl.inflance, cTempl.infsartruck ]
		},
		"infFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infflatmrl, cTempl.infbjeep, cTempl.infminitruck, cTempl.infgbjeep ]
		},
		"infFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infmonhmg, cTempl.infrbuggy, cTempl.infrbjeep, cTempl.infmonsar, cTempl.infkevbloke ]
		},
		"infFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infflatat, cTempl.infgbjeep, cTempl.infminitruck, cTempl.infrbjeep, cTempl.inffiretruck ]
		},
		"infFactory6": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infmonmrl, cTempl.infbuggy, cTempl.inftrike, cTempl.inflance, cTempl.infflatat ]
		},
		"infHvyFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			templates: [ cTempl.infcolpodt, cTempl.infcommcant, cTempl.infcolhmght, cTempl.infcolpodt, cTempl.infcomatt, cTempl.infcommcant ]
		},
		"infCybFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.infcybfl, cTempl.infcybca, cTempl.infcybgr, cTempl.infcybhg ]
		},
	});
	
	// Rank commanders...
	const COL_RANK = (difficulty <= MEDIUM) ? 4 : difficulty + 2; // Professional to Elite
	camSetDroidRank(getObject("deltaCommander"), MIS_DELTA_RANK);
	camSetDroidRank(getObject("colCommander"), COL_RANK);

	// Manage refillable groups
	// Delta groups...
	deltaCommander = camMakeRefillableGroup(camMakeGroup("deltaCommander"), {
		templates: [cTempl.plhcomt]
		}, CAM_ORDER_DEFEND, {
		repair: 50,
		pos: camMakePos("deltaCommandGroup"),
		radius: 20
	});
	deltaCommandGroup = camMakeRefillableGroup(camMakeGroup("deltaCommandGroup"), {
		templates: [ 
			cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, // 6 Assault Cannons
			cTempl.plhasgnt, cTempl.plhasgnt, // 2 Assault Guns
			cTempl.plhhrepht, cTempl.plhhrepht, cTempl.plhhrepht, // 3 Heavy Repair Turrets
			cTempl.plhhaat, cTempl.plhhaat, // 2 Cyclones
			cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
			cTempl.plhstriket, // 1 VTOL Strike Turret
		],
		}, CAM_ORDER_FOLLOW, {
		leader: "deltaCommander",
		repair: 50,
		suborder: CAM_ORDER_DEFEND,
		data: {
			pos: camMakePos("deltaCommandGroup"),
			radius: 20
		}
	});
	deltaVtolSensGroup = camMakeRefillableGroup(camMakeGroup("deltaVtolSensGroup"), {
		templates: [ // 4 HVCs, 4 Assault Guns
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmagv, cTempl.plmagv,
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmagv, cTempl.plmagv,
		]
		}, CAM_ORDER_FOLLOW, {
		leader: "deltaVtolSensor",
		repair: 50,
		suborder: CAM_ORDER_DEFEND,
		data: {
			pos: camMakePos("deltaVtolSensGroup"),
			radius: 20
		}
	});
	deltaVtolCbGroup = camMakeRefillableGroup(camMakeGroup("deltaVtolCbGroup"), {
		templates: [ // 4 HVCs
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmhpvv, cTempl.plmhpvv,
		]
		}, CAM_ORDER_FOLLOW, {
		leader: "deltaVtolCBTower",
		repair: 50,
		suborder: CAM_ORDER_ATTACK,
		data: {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 50,
		}
	});
	deltaVtolTowerGroup1 = camMakeRefillableGroup(camMakeGroup("deltaVtolTowerGroup1"), {
		templates: [ // 4 HVCs, 4 Assault Guns
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmagv, cTempl.plmagv,
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmagv, cTempl.plmagv,
		]
		}, CAM_ORDER_FOLLOW, {
		leader: "deltaVtolTower1",
		repair: 50,
		suborder: CAM_ORDER_ATTACK,
		data: {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 50,
		}
	});
	deltaVtolTowerGroup2 = camMakeRefillableGroup(undefined, {
		templates: [ // 2 HVCs, 2 Assault Guns
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmagv, cTempl.plmagv,
		]
		}, CAM_ORDER_FOLLOW, {
		leader: "deltaVtolTower2",
		repair: 50,
		suborder: CAM_ORDER_ATTACK,
		data: {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 50,
		}
	});
	deltaVtolTowerGroup3 = camMakeRefillableGroup(undefined, {
		templates: [ // 4 HVCs, 4 Assault Guns
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmagv, cTempl.plmagv,
			cTempl.plmhpvv, cTempl.plmhpvv,
			cTempl.plmagv, cTempl.plmagv,
		]
		}, CAM_ORDER_FOLLOW, {
		leader: "deltaVtolTower3",
		repair: 50,
		suborder: CAM_ORDER_ATTACK,
		data: {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 50,
		}
	});
	
	// Collective groups...
	colCommanderGroup = camMakeGroup("colCommander");
	camManageGroup(colCommanderGroup, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("uplinkPatrolPos1"),
			camMakePos("uplinkPatrolPos2"),
			camMakePos("uplinkPatrolPos3")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 65
	});
	camMakeRefillableGroup(camMakeGroup("colCommandGroup"), {
		templates: [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.comhrept, cTempl.comhrept, // 2 Heavy Repair Turrets
			cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 4 Super Auto-Cannons
		],
		factories: ["colFactory1", "colFactory3", "colCybFactory2", "colCybFactory3", "colCybFactory4"],
		obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
		leader: "colCommander",
		repair: 65,
		suborder: CAM_ORDER_ATTACK
	});
	// Mortar/sensor groups
	camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.comsenst, // 1 Sensor
		],
		factories: ["colFactory2"]
	}, CAM_ORDER_ATTACK, {
		repair: 40,
		targetPlayer: CAM_HUMAN_PLAYER
	});
	camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
		],
		factories: ["colFactory2"],
		obj: "colSensor"
	}, CAM_ORDER_FOLLOW, {
		leader: "colSensor",
		repair: 60,
		suborder: CAM_ORDER_DEFEND,
		pos: camMakePos("colAssembly2")
	});
	colKillGroup = camMakeGroup("colKillGroup");
	camManageGroup(colKillGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("colKillGroup")
	});

	// Manage trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("colMainStructs"),
		truckDroid: getObject("colTruck1")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("colMainStructs"),
		truckDroid: getObject("colTruck2")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colWestCyborgBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: (tweakOptions.rec_timerlessMode || difficulty >= HARD),
		structset: camAreaToStructSet("colWestStructs"),
		truckDroid: getObject("colTruck3")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colOutpost",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("outpostStructArea"),
		truckDroid: getObject("colTruck4")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colUplinkBase",
		respawnDelay: TRUCK_TIME,
		structset: camAreaToStructSet("uplinkStructArea"),
		truckDroid: getObject("colTruck5")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colHillBase",
		respawnDelay: TRUCK_TIME,
		structset: camAreaToStructSet("colEastHillStructs"),
		truckDroid: getObject("colTruck6")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colNorthEastBase",
		respawnDelay: TRUCK_TIME,
		structset: camAreaToStructSet("colNEStructs"),
		truckDroid: getObject("colTruck7")
	});
	// Delta trucks
	deltaTruckJob1 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaLZBase",
		rebuildBase: true,
		structset: camAreaToStructSet("deltaLZStructs"),
		truckDroid: getObject("deltaTruck1")
	});
	deltaTruckJob2 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaLZBase",
		rebuildBase: true,
		structset: camAreaToStructSet("deltaLZStructs"),
		truckDroid: getObject("deltaTruck2")
	});
	deltaTruckJob3 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaLZBase",
		rebuildBase: true,
		structset: camAreaToStructSet("deltaMainStructs"),
		truckDroid: getObject("deltaTruck3")
	});
	deltaTruckJob4 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaLZBase",
		rebuildBase: true,
		structset: camAreaToStructSet("deltaMainStructs"),
		truckDroid: getObject("deltaTruck4")
	});
	deltaTruckJob5 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaOverlookBase",
		rebuildBase: true,
		structset: camA4L2DeltaOverlookStructs
	});
	deltaTruckJob6 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaOutpost",
		rebuildBase: true,
		structset: camA4L2DeltaOutpostStructs
	});
	deltaTruckJob7 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaOutpost",
		rebuildBase: true,
		structset: camA4L2DeltaOutpostStructs
	});
	deltaTruckJob8 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaUplinkBase",
		rebuildBase: true,
		structset: camA4L2DeltaUplinkStructs
	});
	deltaTruckJob9 = camManageTrucks(MIS_TEAM_DELTA, {
		label: "deltaUplinkBase",
		rebuildBase: true,
		structset: camA4L2DeltaUplinkStructs
	});

	if (tweakOptions.rec_timerlessMode && difficulty >= HARD)
	{
		// Add another main base truck
		camManageTrucks(CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME * 2,
			structset: camAreaToStructSet("colMainStructs"),
			template: cTempl.comtruckt
		});
	}

	allowExtraWaves = false;
	deltaCommanderDeathTime = 0;
	deltaDetected = false;
	deltaActive = false;
	deltaAggro = false;
	uplinkTimeRemaining = camMinutesToMilliseconds(10);
	missionTimeRemaining = -1;

	hackAddMessage("UPLINK_BEACON", PROX_MSG, CAM_HUMAN_PLAYER);

	updateExtraObjectiveMessage();

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camAutoReplaceObjectLabel(["colCC", "deltaVtolCBTower", "deltaVtolTower1"]);
	// These start unbuilt...
	camAutoReplaceObjectLabel("deltaVtolTower2", {player: MIS_TEAM_DELTA, x: 63, y: 54, stattype: DEFENSE});
	camAutoReplaceObjectLabel("deltaVtolTower3", {player: MIS_TEAM_DELTA, x: 81, y: 67, stattype: DEFENSE});

	queue("infestedBattle", camChangeOnDiff(camSecondsToMilliseconds(90)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("activateMoreFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("activateTeamDelta", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("aggroTeamDelta", camChangeOnDiff(camMinutesToMilliseconds(24)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(90)));
	setTimer("sendDeltaTransporter", camChangeOnDiff(camMinutesToMilliseconds(1.5)));

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}