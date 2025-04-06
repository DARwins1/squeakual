include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage04", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];

var allowWin;
var savedPower;
var phase;
var vtolsDetected;
var foxtrotCommanderDeathTime;
var golfSensorIdx;
var foxtrotIdx;
var golfIdx;

var foxtrotLz1TruckJobs;
var foxtrotLz2TruckJobs;
var foxtrotDefenseTruckJobs;
var golfLz1TruckJobs;
var golfLz2TruckJobs;
var golfDefenseTruckJobs;

var foxtrotPatrolGroup;
var foxtrotCommandGroup;
var foxtrotHoverGroup;
var golfPatrolGroup;

const MIS_TEAM_FOXTROT = 5;
const MIS_TEAM_GOLF = 6;
const MIS_FOXTROT_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(2));
const mis_flankEntrances = [
	"teamEntry1", "teamEntry2", "teamEntry12",
];

//Remove enemy vtols when in the remove zone area.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.droidType !== DROID_SUPERTRANSPORTER)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", MIS_TEAM_GOLF);
});

function heliAttack()
{
	const list = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: [1, 1, 1],
		alternate: true
	};
	camSetVtolData(CAM_INFESTED, undefined, "vtolRemoveZone", list, camChangeOnDiff(camSecondsToMilliseconds(25)), undefined, ext);
}

// Team Golf bomber attacks
// TODO: implement CAM_ORDER_STRIKE here
function vtolAttack()
{
	if (!vtolsDetected)
	{
		playSound(cam_sounds.enemyVtolsDetected);
		vtolsDetected = true;
	}

	let vtolPositions = [
		"vtolAttackPos1",
		"vtolAttackPos2",
		"vtolAttackPos3",
		"vtolAttackPos4",
	];
	
	if (difficulty === INSANE || phase > 3)
	{
		vtolPositions = undefined; // Randomize the spawns each time
	}

	const list = [cTempl.plmbombv, cTempl.plmphosv];
	const ext = {
		minVTOLs: (difficulty >= HARD) ? 4 : 3,
		maxRandomVTOLs: (difficulty >= MEDIUM) ? ((difficulty >= HARD) ? 2 : 1) : 0,
		targetPlayer: CAM_HUMAN_PLAYER
	};

	camSetVtolData(MIS_TEAM_GOLF, vtolPositions, "vtolRemoveZone", list, camChangeOnDiff(camSecondsToMilliseconds(60)), undefined, ext);
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
			cTempl.infcolpodt, cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, cTempl.infcolhmght, cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, cTempl.infcolcanht, cTempl.infcolcanht, // Light Cannons
			cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= EASY) ? cTempl.infcohhcant : undefined), // Add a Heavy Cannon tank 
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= EASY) ? cTempl.infcomtruckt : undefined), // Add an Infested Truck
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;

	// North trench entrances
	// Choose one to spawn from...
	const northEntrances = ["infEntry1", "infEntry2"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(northEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// North east entrance
	// Choose one to spawn from...
	camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South east entrances
	const seEntrances = ["infEntry4", "infEntry5"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(seEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	if (phase < 2) // Disable these once Foxtrot becomes active
	{
		// South canal entrances
		const canalEntrances = ["infEntry6", "infEntry7"];
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(canalEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		// South small trench entrances
		const southEntrances = ["infEntry8", "infEntry9"];
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(southEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}

	// South large trench entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry10"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	if (phase < 3) // Disable these once Golf becomes active
	{
		// Southwest corner entrances
		const swEntrances = ["infEntry11", "infEntry12", "infEntry13"];
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(swEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		// West small trench entrance
		camSendReinforcement(CAM_INFESTED, getObject("infEntry14"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		// Northwest trench entrances
		const northwestEntrances = ["infEntry15", "infEntry17"];
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(northwestEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		// Northwest small trench entrance
		camSendReinforcement(CAM_INFESTED, getObject("infEntry16"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}
	
}

// Start bringing in Foxtrot units from the southeast
function setPhaseTwo()
{
	phase = 2;

	// TODO: Dialogue here...

	setTimer("sendFoxtrotGroundReinforcements", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	setTimer("sendFoxtrotTransporter", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
}

// Start bringing in Golf units from the west
function setPhaseThree()
{
	phase = 3;

	// TODO: Dialogue here...

	setTimer("sendGolfGroundReinforcements", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	setTimer("sendGolfTransporter", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
	setTimer("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(2))); // Start sending Golf VTOLs as well
}

// Bring in Foxtrot/Golf units from every direction
function setPhaseFour()
{
	phase = 4;

	// TODO: Dialogue here...
}

// Bring in Foxtrot halftracks and cyborgs
// Also bring in trucks if necessary
function sendFoxtrotGroundReinforcements()
{
	const entrances = [
		"teamEntry3", "teamEntry4", "teamEntry5",
		"teamEntry6", "teamEntry7",
	];

	// First, spawn any necessary trucks...
	// Check if either LZ is built or has any active trucks
	let jobList;
	const lz1MissingTrucks = getMissingTrucks(foxtrotLz1TruckJobs);
	const lz2MissingTrucks = getMissingTrucks(foxtrotLz2TruckJobs);

	if (!camBaseIsEliminated("foxtrotLz1") || lz1MissingTrucks.length === foxtrotLz1TruckJobs.length)
	{
		jobList = lz1MissingTrucks;
	}
	else if (!camBaseIsEliminated("foxtrotLz2") || lz2MissingTrucks.length === foxtrotLz2TruckJobs.length)
	{
		jobList = lz2MissingTrucks;
	}
	else
	{
		// No LZ exists currently, choose one randomly to start building...
		jobList = (camRand(2) == 0) ? lz1MissingTrucks : lz2MissingTrucks;
	}

	// Also add in any missing defense trucks
	jobList = jobList.concat(getMissingTrucks(foxtrotDefenseTruckJobs));

	for (const job of jobList)
	{
		// Bring in the trucks!
		const tPos = camMakePos(camRandFrom(entrances));
		const tTemp = (phase >= 3 || difficulty >= HARD) ? cTempl.plhtruckht : cTempl.plmtruckht;
		const newTruck = addDroid(MIS_TEAM_FOXTROT, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, job);
	}

	// Now, bring in attack groups
	let templates = [
		cTempl.plhhatht, cTempl.plhhatht, // 2 Tank Killers
		cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamers
		cTempl.plhhaaht, cTempl.plhhaaht, // 2 Cyclones
		cTempl.scytk, cTempl.scytk, // 2 Super Tank Killers
	];
	if (phase > 2 || difficulty >= HARD) templates = templates.concat([cTempl.plhbbht, cTempl.plhbbht]); // Add 2 Bunker Busters
	// const MANY_FOXTROT_UNITS = countDroid(DROID_ANY, MIS_TEAM_FOXTROT).length >= 0; // Don't order droids to repair if there's already a bunch of units around
	const data = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}};
	const attackEntrances = (phase > 3) ? entrances.concat(mis_flankEntrances) : entrances;
	const NUM_SPAWNS = 3;
	for (let i = 0; i < NUM_SPAWNS; i++)
	{
		entrance = getObject(camRandFrom(entrances));
		camSendReinforcement(MIS_TEAM_FOXTROT, entrance, templates, CAM_REINFORCE_GROUND, data);
	}

	if (phase > 3 && foxtrotIdx % 10 === 0)
	{
		// Increase the number of ground attacks every 10 waves in phase 4
		setTimer("sendFoxtrotGroundReinforcements", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	}
	foxtrotIdx++;
}

// Refill Foxtrot's special groups
function sendFoxtrotTransporter()
{
	let pos;
	// First, check if any LZ exists (no more than one should exist at any time)
	if (!camBaseIsEliminated("foxtrotLz1"))
	{
		pos = camMakePos("landingZoneFoxtrot1");
	}
	else if (!camBaseIsEliminated("foxtrotLz2"))
	{
		pos = camMakePos("landingZoneFoxtrot2");
	}
	else
	{
		return; // No LZ present
	}

	// Make a list of droids to bring in in order of importance
	// Commander -> Command Group -> Patrol -> Hover
	let droidQueue = [];
	let commanderSent = false;
	const COMMANDER_ALIVE = getObject("foxtrotCommander") !== null;
	if (!COMMANDER_ALIVE && gameTime > foxtrotCommanderDeathTime + MIS_FOXTROT_COMMANDER_DELAY)
	{
		// Commander doesn't exist and enough time has passed since it died, bring in a new commander
		droidQueue.push(cTempl.plhcomw);
		commanderSent = true;
	}
	if (COMMANDER_ALIVE || commanderSent)
	{
		// Queue up any missing command group units
		droidQueue = droidQueue.concat(camGetRefillableGroupTemplates(foxtrotCommandGroup));
	}
	// Queue up any remaining missing units
	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([foxtrotPatrolGroup, foxtrotHoverGroup]));

	// Next, add grab some droids for the transport
	const droids = [];
	// Push droids from the queue into the transporter
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_FOXTROT, pos, droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryPosFoxtrot"),
				exit: camMakePos("transportEntryPosFoxtrot")
			}
		);
	}
}

// Bring in Golf tanks
// Also bring in trucks if necessary
function sendGolfGroundReinforcements()
{
	const entrances = [
		"teamEntry8", "teamEntry9", "teamEntry10",
		"teamEntry11",
	];

	// First, spawn any necessary trucks...
	// Check if either LZ is built or has any active trucks
	let jobList;
	const lz1MissingTrucks = getMissingTrucks(golfLz1TruckJobs);
	const lz2MissingTrucks = getMissingTrucks(golfLz2TruckJobs);

	if (!camBaseIsEliminated("golfLz1") || lz1MissingTrucks.length === golfLz1TruckJobs.length)
	{
		jobList = lz1MissingTrucks;
	}
	else if (!camBaseIsEliminated("golfLz2") || lz2MissingTrucks.length === golfLz2TruckJobs.length)
	{
		jobList = lz2MissingTrucks;
	}
	else
	{
		// No LZ exists currently, choose one randomly to start building...
		jobList = (camRand(2) == 0) ? lz1MissingTrucks : lz2MissingTrucks;
	}

	// Also add in any missing defense trucks
	jobList = jobList.concat(getMissingTrucks(golfDefenseTruckJobs));

	for (const job of jobList)
	{
		// Bring in the trucks!
		const tPos = camMakePos(camRandFrom(entrances));
		const tTemp = (phase > 3 || difficulty >= HARD) ? cTempl.plhtruckt : cTempl.plmtruckt;
		const newTruck = addDroid(MIS_TEAM_GOLF, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, job);
	}

	// Now, bring in attack groups
	const templates = [
		cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, // 6 HVCs
		cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, // 8 HRAs
		cTempl.plhhaat, cTempl.plhhaat, // 2 Cyclones
	];
	// const MANY_GOLF_UNITS = countDroid(DROID_ANY, MIS_TEAM_GOLF).length >= 0; // Don't order droids to repair if there's already a bunch of units around
	const data = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}};
	const attackEntrances = (phase > 3) ? entrances.concat(mis_flankEntrances) : entrances;
	const NUM_SPAWNS = 1;
	for (let i = 0; i < NUM_SPAWNS; i++)
	{
		entrance = getObject(camRandFrom(entrances));
		camSendReinforcement(MIS_TEAM_GOLF, entrance, templates, CAM_REINFORCE_GROUND, data);
	}

	if (phase > 3 && golfIdx % 10 === 0)
	{
		// Increase the number of ground attacks every 10 waves in phase 4
		setTimer("sendGolfGroundReinforcements", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	}
	golfIdx++;
}

// Refill Golf's patrol group and bring in sensors + artillery
function sendGolfTransporter()
{
	let pos;
	// First, check if any LZ exists (no more than one should exist at any time)
	if (!camBaseIsEliminated("golfLz1"))
	{
		pos = camMakePos("landingZoneGolf1");
	}
	else if (!camBaseIsEliminated("golfLz2"))
	{
		pos = camMakePos("landingZoneGolf2");
	}
	else
	{
		return; // No LZ present
	}

	// Make a list of droids to bring in in order of importance
	// Patrol -> Sensor + Artillery
	let droidQueue = [];
	// Queue up any missing patrol units
	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates(golfPatrolGroup));

	// Also queue up a sensor template
	droidQueue.push(cTempl.plhsenst);
	// Define some artillery support templates
	const artTemplates = [
		cTempl.plhhowt, // Howitzer
		(phase > 3 || difficulty >= HARD) ? cTempl.plhrmortt : cTempl.plmrmortt, // Pepperpot (Python or Cobra)
	]

	// Next, add grab some droids for the transport
	const droids = [];
	// Push droids from the queue into the transporter
	for (let i = 0; i < 10; i++)
	{
		if (camDef(droidQueue[i]))
		{
			droids.push(droidQueue[i]);
		}
		else
		{
			// If the queue is depleted, choose an artillery template instead
			droids.push(camRandFrom(artTemplates));
		}
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_GOLF, pos, droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryPosGolf"),
				exit: camMakePos("transportEntryPosGolf")
			}
		);
	}
}

// Assign units to their respective groups
function eventTransporterLanded(transport)
{
	if (transport.player === MIS_TEAM_FOXTROT)
	{
		// Assign Foxtrot reinforcements
		const transDroids = camGetTransporterDroids(transport.player);
		const transCommander = transDroids.filter((droid) => (droid.droidType == DROID_COMMAND))[0]; // Command Turret droid
		const transOther = transDroids.filter((droid) => (droid.droidType != DROID_COMMAND)); // List of remaining units

		// Assign the commander
		if (camDef(transCommander))
		{
			addLabel(transCommander, "foxtrotCommander");
			// Set the commander's rank 
			// Ranges from Elite to Hero:
			camSetDroidRank(transCommander, (difficulty <= EASY) ? 6 : (difficulty + 4));
			camManageGroup(camMakeGroup("foxtrotCommander"), CAM_ORDER_ATTACK, {
				pos: [ // Focus on these spots first...
					camMakePos("patrolPos1"),
					camMakePos("patrolPos2"),
					camMakePos("patrolPos3"),
					camMakePos("patrolPos4"),
					camMakePos("patrolPos5"),
					camMakePos("patrolPos6"),
					camMakePos("patrolPos7"),
					camMakePos("patrolPos8"),
					camMakePos("patrolPos9"),
					camMakePos("patrolPos10"),
					camMakePos("patrolPos11"),
					camMakePos("patrolPos12"),
					camMakePos("focusPos1"),
					camMakePos("focusPos2"),
					camMakePos("focusPos3"),
				],
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 75
			});
		}

		// Assign other units to their refillable groups
		camAssignToRefillableGroups(transOther, [foxtrotPatrolGroup, foxtrotCommandGroup, foxtrotHoverGroup]);
	}
	else if (transport.player === MIS_TEAM_GOLF)
	{
		// Assign Golf reinforcements
		const transDroids = camGetTransporterDroids(transport.player);
		// const transSensor = transDroids.filter((droid) => (droid.droidType == DROID_SENSOR))[0];
		let transOther = transDroids.filter((droid) => (droid.droidType != DROID_SENSOR));

		// Assign other units to their refillable groups
		transOther = camAssignToRefillableGroups(transOther, golfPatrolGroup); // Hold onto any leftovers

		// if (camDef(transSensor))
		// {
		// 	// Add a label to this sensor
		// 	const sensorLabel = "golfSensor" + golfSensorIdx++;
		// 	addLabel(transSensor, sensorLabel);

		// 	// Take any remaining leftovers and assign them to follow the sensor
		// 	camManageGroup(transOther, CAM_ORDER_FOLLOW, {
		// 		leader: sensorLabel,
		// 		leaderOrder: CAM_ORDER_ATTACK,
		// 		data: {
		// 			targetPlayer: CAM_HUMAN_PLAYER,
		// 			repair: 50
		// 		},
		// 		suborder: CAM_ORDER_ATTACK,
		// 		targetPlayer: CAM_HUMAN_PLAYER
		// 	})
		// }
	}

}

function eventDestroyed(obj)
{
	if (obj.type === DROID && obj.player === MIS_TEAM_FOXTROT && obj.droidType === DROID_COMMAND)
	{
		// Prevent team Foxtrot from bringing in another commander for some time...
		foxtrotCommanderDeathTime = gameTime;
	}
}

// Loops through a truck job list, and returns a list of all the jobs with missing trucks
function getMissingTrucks(jobList)
{
	const missingList = [];
	for (const job of jobList)
	{
		if (!camDef(camGetTruck(job)))
		{
			// Truck doesn't exist, add it to the missing list
			missingList.push(job);
		}
	}

	return missingList;
}

// Allow a win if a transporter was launched.
// NOTE: The player doesn't have to transport a construction droid, since trucks will be given
// to the player at the start of Act 4.
// Also, take up to 1 thousand of the player's power and stash it for the next mission.
function eventTransporterLaunch(transporter)
{
	if (transporter.player === CAM_HUMAN_PLAYER)
	{
		allowWin = true;

		// Stash away up to 1k power every time the player launches a transport
		// const POWER_PER_TRANSPORT = 1000;
		// const CURRENT_POWER = playerPower(CAM_HUMAN_PLAYER);

		// savedPower = Math.min(CURRENT_POWER, POWER_PER_TRANSPORT);
		// setPower(Math.max(CURRENT_POWER - POWER_PER_TRANSPORT, 0), CAM_HUMAN_PLAYER);
	}
}

function checkIfLaunched()
{
	// Set the player's power to whatever they've managed to stash
	// setPower(savedPower, CAM_HUMAN_PLAYER);

	if (allowWin)
	{
		return true;
	}
}

function dumpStructSets()
{
	camDumpStructSet("foxtrotDefenses", "camA3L9FoxtrotDefenseStructs");
	camDumpStructSet("foxtrotLzStructs1", "camA3L9FoxtrotLZ1Structs");
	camDumpStructSet("foxtrotLzStructs2", "camA3L9FoxtrotLZ2Structs");

	camDumpStructSet("golfDefenses", "camA3L9GolfDefenseStructs");
	camDumpStructSet("golfLzStructs1", "camA3L9GolfLZ1Structs");
	camDumpStructSet("golfLzStructs2", "camA3L9GolfLZ2Structs");
}

// This mission is mostly sending Infested attack waves that eventually shift over to Foxtrot/Golf attack waves
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_EVACUATION, "A4L1", {
		reinforcements: camMinutesToSeconds(5.5), // Duration the transport "leaves" map.
		gameOverOnDeath: false, // Don't fail when the player runs out of stuff
		callback: "checkIfLaunched"
	});
	camSetExtraObjectiveMessage(_("Evacuate as many units as possible"));
	setMissionTime(-1); // Infinite time

	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");
	const entryPos = camMakePos("transportEntryPos")

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	camSetupTransporter(startPos.x, startPos.y, entryPos.x, entryPos.y);

	// Grant the teams all the tech the player has found until A3L7, plus the Sensor Upgrade
	const teamResearch = camA3L9EnemyResearch.concat(["R-Sys-Sensor-Upgrade01"]);

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(teamResearch, MIS_TEAM_FOXTROT);
	camCompleteRequiredResearch(teamResearch, MIS_TEAM_GOLF);

	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_TEAM_FOXTROT, (PLAYER_COLOR !== 13) ? 13 : 4); // Foxtrot to infrared or red
	changePlayerColour(MIS_TEAM_GOLF, (PLAYER_COLOR !== 7) ? 7 : 0); // Golf to cyan or green

	setAlliance(MIS_TEAM_FOXTROT, MIS_TEAM_GOLF, true);

	// Foxtrot & Golf LZs
	camSetEnemyBases({
		"foxtrotLz1": {
			cleanup: "foxtrotLzStructs1",
			detectMsg: "FOXTROT_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"foxtrotLz2": {
			cleanup: "foxtrotLzStructs2",
			detectMsg: "FOXTROT_LZBASE2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"golfLz1": {
			cleanup: "golfLzStructs1",
			detectMsg: "GOLF_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"golfLz2": {
			cleanup: "golfLzStructs2",
			detectMsg: "GOLF_LZBASE2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	// Trucks...
	foxtrotLz1TruckJobs = [];
	foxtrotLz2TruckJobs = [];
	foxtrotDefenseTruckJobs = [];
	golfLz1TruckJobs = [];
	golfLz2TruckJobs = [];
	golfDefenseTruckJobs = [];

	// Foxtrot trucks
	// 2 Trucks for each LZ...
	foxtrotLz1TruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotLz1",
		rebuildBase: true,
		structset: camA3L9FoxtrotLZ1Structs
	}));
	foxtrotLz1TruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotLz1",
		rebuildBase: true,
		structset: camA3L9FoxtrotLZ1Structs
	}));

	foxtrotLz2TruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotLz2",
		rebuildBase: true,
		structset: camA3L9FoxtrotLZ2Structs
	}));
	foxtrotLz2TruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotLz2",
		rebuildBase: true,
		structset: camA3L9FoxtrotLZ2Structs
	}));

	// 6 Trucks for general defenses
	foxtrotDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotDefenses",
		area: "foxtrotDefenses",
		structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotDefenses",
		area: "foxtrotDefenses",
		structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotDefenses",
		area: "foxtrotDefenses",
		structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotDefenses",
		area: "foxtrotDefenses",
		structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotDefenses",
		area: "foxtrotDefenses",
		structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_FOXTROT, {
		label: "foxtrotDefenses",
		area: "foxtrotDefenses",
		structset: camA3L9FoxtrotDefenseStructs
	}));

	// Golf trucks
	// 2 Trucks for each LZ...
	golfLz1TruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfLz1",
		rebuildBase: true,
		structset: camA3L9GolfLZ1Structs
	}));
	golfLz1TruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfLz1",
		rebuildBase: true,
		structset: camA3L9GolfLZ1Structs
	}));

	golfLz2TruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfLz2",
		rebuildBase: true,
		structset: camA3L9GolfLZ2Structs
	}));
	golfLz2TruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfLz2",
		rebuildBase: true,
		structset: camA3L9GolfLZ2Structs
	}));

	// 6 Trucks for general defenses
	golfDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfDefenses",
		area: "golfDefenses",
		structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfDefenses",
		area: "golfDefenses",
		structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfDefenses",
		area: "golfDefenses",
		structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfDefenses",
		area: "golfDefenses",
		structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfDefenses",
		area: "golfDefenses",
		structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(MIS_TEAM_GOLF, {
		label: "golfDefenses",
		area: "golfDefenses",
		structset: camA3L9GolfDefenseStructs
	}));

	foxtrotPatrolGroup = camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.plhhatht, cTempl.plhhatht, cTempl.plhhatht, cTempl.plhhatht, // 4 Tank Killers
			cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 6 Thermite Flamers
			cTempl.plhhaaht, cTempl.plhhaaht, cTempl.plhhaaht, cTempl.plhhaaht, // 4 Cyclones
			cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killers
		]
	}, CAM_ORDER_PATROL, {
		repair: 75,
		pos: [
			camMakePos("patrolPos10"),
			camMakePos("patrolPos11"),
			camMakePos("patrolPos12"),
		],
		interval: camSecondsToMilliseconds(32)
	});
	foxtrotHoverGroup = camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, // 8 Tank Killers
			cTempl.plhbbh, cTempl.plhbbh, cTempl.plhbbh, cTempl.plhbbh, // 4 Bunker Busters
			cTempl.plhinfh, cTempl.plhinfh, cTempl.plhinfh, cTempl.plhinfh, // 4 Infernos
		]
	}, CAM_ORDER_PATROL, {
		repair: 75,
		pos: [
			camMakePos("hoverPatrolPos4"),
			camMakePos("hoverPatrolPos5"),
			camMakePos("hoverPatrolPos6"),
			camMakePos("hoverPatrolPos7"),
		],
		interval: camSecondsToMilliseconds(22)
	});
	foxtrotCommandGroup = camMakeRefillableGroup(undefined, {
		templates: [ // 6 Tank Killers, 6 BBs, 6 Infernos
			cTempl.plhhatw, cTempl.plhhatw,
			cTempl.plhbbw, cTempl.plhbbw,
			cTempl.plhinfw, cTempl.plhinfw,
			cTempl.plhhatw, cTempl.plhhatw,
			cTempl.plhbbw, cTempl.plhbbw,
			cTempl.plhinfw, cTempl.plhinfw,
			cTempl.plhhatw, cTempl.plhhatw,
			cTempl.plhbbw, cTempl.plhbbw,
			cTempl.plhinfw, cTempl.plhinfw,
		],
	}, CAM_ORDER_FOLLOW, {
		leader: "foxtrotCommander",
		repair: 50,
		suborder: CAM_ORDER_DEFEND,
		data: {
			pos: camMakePos("foxtrotFallbackPos"),
			radius: 24
		}
	});

	golfPatrolGroup = camMakeRefillableGroup(undefined, {
		templates: [
			cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, // 8 HRAs
			cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, cTempl.plmhpvt, // 6 HVCs
			cTempl.plhhaat, cTempl.plhhaat, cTempl.plhhaat, cTempl.plhhaat, // 4 Cyclones
		]
	}, CAM_ORDER_PATROL, {
		repair: 50,
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6"),
			camMakePos("patrolPos7"),
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9"),
		],
		interval: camSecondsToMilliseconds(46)
	});

	allowWin = false;
	savedPower = 0;
	phase = 1;
	foxtrotCommanderDeathTime = 0;
	golfSensorIdx = 1;
	foxtrotIdx = 0;
	golfIdx = 0;
	vtolsDetected = false;

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	heliAttack();
	queue("setPhaseTwo", camMinutesToMilliseconds(5)); // Foxtrot units start arriving
	queue("setPhaseThree", camMinutesToMilliseconds(10)); // Golf units start arriving
	queue("setPhaseFour", camMinutesToMilliseconds(18)); // Foxtrot/Golf begin flanking the player
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(40)));

	// TODO: Briefing dialogue

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
	camSetWeather(CAM_WEATHER_RAINSTORM);

	// dumpStructSets(); // DEBUG
}