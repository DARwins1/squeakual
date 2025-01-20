include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01",
];

var heavyWaveIdx;
var supportWaveIdx;
var sensorIdx;
var wavesDone;

var colTruckJob1;
var colTruckJob2;
var colTruckJob3;
var colTruckJob4;

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function vtolAttack()
{
	// Cluster Bombs, Assault Guns, and Lancers
	const templates = [cTempl.colbombv, cTempl.colagv, cTempl.colatv];
	const ext = {
		limit: [2, 3, 2],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, ["vtolAttackPos1", "vtolAttackPos2"], "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), undefined, ext);
}

// Starts the Collective wave loops
function startCollectiveAttacks()
{
	// TODO: Dialogue here...

	queueCollectiveHeavyWave();
	// Send a heavy wave roughly every 4 minutes...
	setTimer("queueCollectiveHeavyWave", camChangeOnDiff(camMinutesToMilliseconds(4)));
	// And a support wave every 2 minutes...
	setTimer("sendCollectiveSupportWave", camChangeOnDiff(camMinutesToMilliseconds(2)));
}

// Marks the entrances for the imminent Collective armor wave
function queueCollectiveHeavyWave()
{
	switch (heavyWaveIdx)
	{
	case 1:
		// Mark entrances 6 & 7
		hackAddMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 2:
		// Mark entrances 7 & 8
		hackAddMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 3:
		// Mark entrances 3 & 6
		hackAddMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 4:
		// Mark entrances 1 & 3
		hackAddMessage("COL_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 5:
		// Mark entrances 2, 6 & 8
		hackAddMessage("COL_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);

		// Stop spawning heavy and support waves from this point on
		removeTimer("queueCollectiveHeavyWave");
		removeTimer("sendCollectiveSupportWave");
		break;
	}
	// Bring in the actual units 20 seconds later
	queue("sendCollectiveHeavyWave", camChangeOnDiff(camSecondsToMilliseconds(20)));
}

// Spawns large Collective attack waves and removes the beacons that precede them
function sendCollectiveHeavyWave()
{
	const orderData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}};
	switch (heavyWaveIdx)
	{
	case 1:
		// Un-mark entrances 6 & 7
		hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids1 = [
			cTempl.cohhcant, // 1 Heavy Cannon
			cTempl.commcant, cTempl.commcant, cTempl.commcant, // 3 Medium Cannons
			cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 3 Heavy Machineguns
			cTempl.colaaht, cTempl.colaaht, // 2 Hurricanes
		];

		// Send the tanks!
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry6"), heavyDroids1, CAM_REINFORCE_GROUND, orderData);
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry7"), heavyDroids1, CAM_REINFORCE_GROUND, orderData);
		break;
	case 2:
		// Un-mark entrances 7 & 8
		hackRemoveMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids2 = [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.commcant, cTempl.commcant, cTempl.commcant, cTempl.commcant, // 4 Medium Cannons
			cTempl.comhmgt, cTempl.comhmgt, // 2 Heavy Machineguns
			cTempl.comhaat, // 1 Cyclone
		];

		// Send the tanks!
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry7"), heavyDroids2, CAM_REINFORCE_GROUND, orderData);
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry8"), heavyDroids2, CAM_REINFORCE_GROUND, orderData);
		break;
	case 3:
		// Un-mark entrances 3 & 6
		hackRemoveMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids3 = [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, // 4 MRAs
			cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, // 6 MRPs
			cTempl.comhaat, // 1 Cyclone
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry3"), heavyDroids3, CAM_REINFORCE_GROUND, orderData);

		// Spawn a Collective commander
		const commanderPos1 = camMakePos("colEntry6");
		const commanderTemp1 = cTempl.comcomt;
		const commDroid1 = addDroid(CAM_THE_COLLECTIVE, commanderPos1.x, commanderPos1.y, 
			camNameTemplate(commanderTemp1), commanderTemp1.body, commanderTemp1.prop, "", "", commanderTemp1.weap
		);
		
		addLabel(commDroid1, "colCommander1");
		// Set the commander's rank (ranges from Trained to Professional)
		const COMMANDER_RANK1 = (difficulty <= EASY) ? 2 : (difficulty);
		camSetDroidRank(commDroid1, COMMANDER_RANK1);
		// Order the commander to attack
		camManageGroup(camMakeGroup(commDroid1), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

		// Spawn the commander's escorts
		const commanderDroids1 = [
			cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			cTempl.comagt, cTempl.comagt, // 2 Assault Guns
			cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
			cTempl.comhaat, // 1 Cyclone
			cTempl.comhrept, // 1 Heavy Repair Turret
		];
		const colCommanderGroup1 = camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry6"), commanderDroids1, CAM_REINFORCE_GROUND);
		camManageGroup(colCommanderGroup1, CAM_ORDER_FOLLOW, {leader: "colCommander1", suborder: CAM_ORDER_ATTACK});
		break;
	case 4:
		// Un-mark entrances 1 & 3
		hackRemoveMessage("COL_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids4 = [
			cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
			cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 3 HRAs
			cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry3"), heavyDroids4, CAM_REINFORCE_GROUND, orderData);

		const assaultDroids4 = [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Assault Cannons
			cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
			cTempl.comhaat, // 1 Cyclone
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry1"), assaultDroids4, CAM_REINFORCE_GROUND, orderData);

		// Also include a special Tiger tank
		const assaultPos = camMakePos("colEntry1");
		const assaultTemp = cTempl.cohacant; // Assault Cannon Tiger Tracks
		const assaultDroid = addDroid(CAM_THE_COLLECTIVE, assaultPos.x, assaultPos.y, 
			camNameTemplate(assaultTemp), assaultTemp.body, assaultTemp.prop, "", "", assaultTemp.weap
		);
		// Order the tank to attack
		camManageGroup(camMakeGroup(assaultDroid), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
		
		// Make this tank drop an artifact
		addLabel(assaultDroid, "colAssaultTank");
		camAddArtifact({"colAssaultTank": { tech: "R-Wpn-Cannon5" }}); // Assault Cannon
		break;
	case 5:
		// Un-mark entrances 2, 6 & 8
		hackRemoveMessage("COL_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids5 = [
			cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 3 Heavy Cannons
			cTempl.comacant, cTempl.comacant, // 2 Assault Cannons
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry2"), heavyDroids5, CAM_REINFORCE_GROUND, orderData);
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry8"), heavyDroids5, CAM_REINFORCE_GROUND, orderData);

		// Spawn another Collective commander
		const commanderPos2 = camMakePos("colEntry6");
		const commanderTemp2 = cTempl.cohcomt;
		const commDroid2 = addDroid(CAM_THE_COLLECTIVE, commanderPos2.x, commanderPos2.y, 
			camNameTemplate(commanderTemp2), commanderTemp2.body, commanderTemp2.prop, "", "", commanderTemp2.weap
		);
		
		addLabel(commDroid2, "colCommander2");
		// Set the commander's rank (ranges from Regular to Veteran)
		const COMMANDER_RANK2 = (difficulty <= EASY) ? 3 : (difficulty + 1);
		camSetDroidRank(commDroid2, COMMANDER_RANK2);
		// Order the commander to attack
		camManageGroup(camMakeGroup(commDroid2), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

		// Spawn the commander's escorts
		const commanderDroids2 = [
			cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
			cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.cohraat, // 1 Whirlwind
			cTempl.comhrept, // 1 Heavy Repair Turret
		];
		const colCommanderGroup2 = camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry6"), commanderDroids2, CAM_REINFORCE_GROUND);
		camManageGroup(colCommanderGroup2, CAM_ORDER_FOLLOW, {leader: "colCommander2", suborder: CAM_ORDER_ATTACK});

		camCallOnce("finishWaves");
		break;
	default:
		break;
	}
	heavyWaveIdx++;
}

// Sends smaller waves to support the main army
function sendCollectiveSupportWave()
{
	// Support waves come in three forms:
	// 1.) Halftrack/Cyborg group
	// 2.) Sensor/Bombard group
	// 3.) Hover group
	// The first two support groups may also spawn with a truck, which will attempt to build an LZ nearby

	// Entrances used by non-hover groups
	const supportEntrances = ["colEntry4", "colEntry7", "colEntry8"];
	if (supportWaveIdx >= 5) supportEntrances.push("colEntry2");
	const chosenEntrance = getObject(supportEntrances[camRand(supportEntrances.length)])

	const orderData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}};
	let spawnTruck = false;
	switch (supportWaveIdx % 3)
	{
	case 0: // Halftracks & Cyborgs
		spawnTruck = true;
		let halfBorgDroids = [
			cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
			cTempl.commraht, cTempl.commraht, // 2 MRAs
			cTempl.cybth, cTempl.cybth, cTempl.cybth, // 3 Thermite Flamers
			cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, // 3 Heavy Machinegunners
		];
		if (supportWaveIdx >= 5) halfBorgDroids = camArrayReplaceWith(halfBorgDroids, cTempl.cybhg, cTempl.cybag); // Replace with Assault Gunners
		// Send 'em in!
		camSendReinforcement(CAM_THE_COLLECTIVE, chosenEntrance, halfBorgDroids, CAM_REINFORCE_GROUND, orderData);
		break;
	case 1: // Sensor + Bombards
		spawnTruck = true;
		// Spawn a sensor
		const sensorPos = camMakePos(chosenEntrance);
		const sensorTemp = cTempl.comsensht;
		const sensorDroid = addDroid(CAM_THE_COLLECTIVE, sensorPos.x, sensorPos.y, 
			camNameTemplate(sensorTemp), sensorTemp.body, sensorTemp.prop, "", "", sensorTemp.weap
		);
		const sensorLabel = ("colSensor" + sensorIdx++);
		addLabel(sensorDroid, sensorLabel);
		// Order the sensor to attack
		camManageGroup(camMakeGroup(sensorDroid), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

		// Spawn the sensor's escorts
		let sensorEscortDroids = [
			cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 6 Bombards
			cTempl.comatht, cTempl.comatht, // 2 Lancers
		];
		if (supportWaveIdx >= 5) sensorEscortDroids = camArrayReplaceWith(sensorEscortDroids, cTempl.comatht, cTempl.comhatht); // Replace with Tank Killers
		const colSensorGroup = camSendReinforcement(CAM_THE_COLLECTIVE, chosenEntrance, sensorEscortDroids, CAM_REINFORCE_GROUND);
		camManageGroup(colSensorGroup, CAM_ORDER_FOLLOW, {leader: sensorLabel, suborder: CAM_ORDER_ATTACK});
		break;
	case 2: // Annoying Hover Bastards
		let hoverDroids = [
			cTempl.comath, cTempl.comath, // 2 Lancers
			cTempl.comhpvh, cTempl.comhpvh, // 2 HVCs
			cTempl.commrah, cTempl.commrah, // 2 MRAs
			cTempl.combbh, // 1 Bunker Buster
		];
		if (supportWaveIdx >= 5) hoverDroids = camArrayReplaceWith(hoverDroids, cTempl.commrah, cTempl.cohhrah); // Replace with HRAs
		if (supportWaveIdx >= 5 && difficulty >= MEDIUM) hoverDroids = camArrayReplaceWith(hoverDroids, cTempl.comath, cTempl.comhath); // Replace with Tank Killers
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry5"), hoverDroids, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("hoverPatrolPos1"),
					camMakePos("hoverPatrolPos2"),
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos4"),
				],
				interval: camSecondsToMilliseconds(20)
			}
		});
		break;
	}
	supportWaveIdx++;

	if (spawnTruck)
	{
		// Find a job for the new truck
		// Just iterate over the jobs until we find an empty one...
		let job = colTruckJob1;
		if (camDef(camGetTruck(colTruckJob1))) job = colTruckJob2;
		if (camDef(camGetTruck(colTruckJob2))) job = colTruckJob3;
		if (camDef(camGetTruck(colTruckJob3))) job = colTruckJob4;
		if (camDef(camGetTruck(colTruckJob4))) return; // All jobs filled!

		const truckPos = camMakePos(chosenEntrance);
		const truckTemp = cTempl.comtruckht; // Truck Panther Half-tracks
		const newTruck = addDroid(CAM_THE_COLLECTIVE, truckPos.x, truckPos.y, camNameTemplate(truckTemp), truckTemp.body, truckTemp.prop, "", "", truckTemp.weap);
		camAssignTruck(newTruck, job);
	}
}

// Land Collective Super Cyborgs at a random built LZ
function sendCollectiveTransporter()
{
	// Set reinforcement droids
	let cyborgPool = [
		cTempl.cybla, // Lancer
		cTempl.cybth, // Thermite Flamer
		cTempl.cybag, // Assault Gunner
		cTempl.scygr, // Super Grenadier
		cTempl.scymc, // Super Heavy Gunner
	];
	if (supportWaveIdx >= 5) cyborgPool = camArrayReplaceWith(cyborgPool, cTempl.cybla, cTempl.scytk); // Replace with Super Tank Killers
	if (supportWaveIdx >= 5) cyborgPool = camArrayReplaceWith(cyborgPool, cTempl.scymc, cTempl.scyac); // Replace with Super Auto-Cannons

	const droids = [];
	for (let i = 0; i < 10; i++)
	{
		droids.push(cyborgPool[camRand(cyborgPool.length)]);
	}

	// Get all available LZs
	const lzPool = [];
	if (!camBaseIsEliminated("colLZ1")) lzPool.push(camMakePos("landingZoneCollective1"));
	if (!camBaseIsEliminated("colLZ2")) lzPool.push(camMakePos("landingZoneCollective2"));
	if (!camBaseIsEliminated("colLZ3")) lzPool.push(camMakePos("landingZoneCollective3"));
	if (!camBaseIsEliminated("colLZ4")) lzPool.push(camMakePos("landingZoneCollective4"));

	// If we have a valid LZ, send the transport
	if (lzPool.length > 0)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, lzPool[camRand(lzPool.length)], droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: {x: 80, y: 20},
				exit: {x: 80, y: 20},
			}
		);
	}
}

function sendInfestedReinforcements()
{	
	// NOTE: These entrance numbers are different from A2L2...
	const CORE_SIZE = 4 + camRand(5);
	const FODDER_SIZE = 14 + camRand(3);

	// North trench entrances
	// Choose one to spawn from...
	let northTrenchEntrance;
	switch (camRand(2))
	{
	case 0:
		// Road entrance
		northTrenchEntrance = getObject("infEntry1");
		break;
	case 1:
		// Trench entrance
		northTrenchEntrance = getObject("infEntry2");
		break;
	}
	const nTrenchDroids = camRandInfTemplates(
		[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt], 
		CORE_SIZE, FODDER_SIZE
	);
	camSendReinforcement(CAM_INFESTED, northTrenchEntrance, nTrenchDroids, CAM_REINFORCE_GROUND);

	// North east entrances
	// Choose one to spawn from...
	let northeastEntrance;
	switch (camRand(2))
	{
	case 0:
		// Road entrance
		northeastEntrance = getObject("infEntry3");
		break;
	case 1:
		// Trench entrance
		northeastEntrance = getObject("infEntry4");
		break;
	}
	const neDroids = camRandInfTemplates(
		[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt], 
		CORE_SIZE / 2, FODDER_SIZE * 2/3
	);
	camSendReinforcement(CAM_INFESTED, northeastEntrance, neDroids, CAM_REINFORCE_GROUND);

	// South canal entrance
	const canalDroids = camRandInfTemplates(
		[cTempl.basher, cTempl.inffiretruck, cTempl.infkevbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy],
		CORE_SIZE / 2, 2 * FODDER_SIZE / 3
	);
	camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), canalDroids, CAM_REINFORCE_GROUND);
}

// Finish spawning Collective waves, and start a time limit for the player to clean up the map
function finishWaves()
{
	// TODO: Dialogue here...

	wavesDone = true;
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(15)));
	}
	else
	{
		setMissionTime(-1);
	}
}

// Returns true if the Collective waves have finished, undefined otherwise
function wavesOver()
{
	if (wavesDone)
	{
		return true; // Waves have finished spawning
	}
	else
	{
		return undefined; // More waves to go...
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	setReinforcementTime(LZ_COMPROMISED_TIME);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L5S", {
		ignoreInfestedUnits: true,
		callback: "wavesOver"
	});
	camSetExtraObjectiveMessage(_("Survive the Collective assault"))

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		// These LZs can be built later by enemy trucks:
		"colLZ1": {
			cleanup: "colLZArea1",
			detectMsg: "COL_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colLZ2": {
			cleanup: "colLZArea2",
			detectMsg: "COL_LZBASE2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colLZ3": {
			cleanup: "colLZArea3",
			detectMsg: "COL_LZBASE3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colLZ4": {
			cleanup: "colLZArea4",
			detectMsg: "COL_LZBASE4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	// Collective trucks
	colTruckJob1 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colLZ1",
		rebuildBase: true,
		structset: camA3L4ColLZ1Structs
	});
	colTruckJob2 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colLZ2",
		rebuildBase: true,
		structset: camA3L4ColLZ2Structs
	});
	colTruckJob3 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colLZ3",
		rebuildBase: true,
		structset: camA3L4ColLZ3Structs
	});
	colTruckJob4 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colLZ4",
		rebuildBase: true,
		structset: camA3L4ColLZ4Structs
	});

	heavyWaveIdx = 1;
	supportWaveIdx = 1;
	sensorIdx = 1;
	wavesDone = false;

	queue("startCollectiveAttacks", camChangeOnDiff(camSecondsToMilliseconds(20)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	// sendInfestedReinforcements();
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(60)));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3)));

	// Placeholder for the actual briefing sequence
	// camQueueDialogue([
	// 	{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
	// 	{text: "LIEUTENANT: Sir, Team Bravo has evacuated with all that they could. They're awaiting further orders.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Well done, Commander Bravo.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: If we're to salvage this operation, we'll need as many able-bodied men as possible.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Commander Charlie, report your situation.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: We're holed up alright sir.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: But we've spotted Collective forces to the north of our position.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: They've been busy setting up some defenses.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: There's also been lot of fighting between the local scavengers.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CHARLIE: It looks like some of the scavengers are working with the Collective.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: I don't have a hard time believing that.", delay: 4, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Lieutenant, keep parsing through the Collective's transmissions.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Find out why these scavengers are working along with the Collective.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "LIEUTENANT: On it, sir.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Commander Bravo, take your forces and assume command of Charlie's base.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Team Charlie will reposition to a new location.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Secure the area, and hold for further instructions once the base site is secure.", delay: 3, sound: CAM_RCLICK},
	// ]);

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.55, .5, .6);
}