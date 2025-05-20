include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage06", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage06", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals05", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Sys-Engineering02", "R-Cyborg-Metals05",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF02",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine05", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade01", "R-Sys-Sensor-Upgrade01",
	"R-Vehicle-Armor-Heat01", "R-Cyborg-Armor-Heat01", "R-Wpn-Howitzer-Damage02",
	"R-Wpn-Howitzer-ROF01", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage04", "R-Wpn-Mortar-Damage04",
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];

var colCommanderGroup1;
var colCommanderGroup2;
var colCommanderGroup3;
var colHoverGroup;

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack()
{
	const templates = [cTempl.helcan, cTempl.helhmg, cTempl.helpod];
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos", "heliRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1)), "heliTower", ext);
}

function infHeliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1
	};
	camSetVtolData(CAM_INFESTED, undefined, "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(45)), undefined, ext);
}

// Assign a label to the Collective's VTOL Strike droid
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comstriket))
	{
		addLabel(droid, "colVtolSensor");
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
		].concat((difficulty >= MEDIUM) ? cTempl.infcohhcant : []), // Add a Heavy Cannon tank 
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= MEDIUM) ? cTempl.infcomtruckt : []), // Add an Infested Truck
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;

	// North trench entrances
	// Choose one to spawn from...
	const northEntrances = ["infEntry1", "infEntry2"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(northEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// North east entrance
	camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South east entrances
	// Choose one to spawn from...
	const seEntrances = ["infEntry4", "infEntry5"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(seEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South canal entrances
	// Choose one to spawn from...
	const canalEntrances = ["infEntry6", "infEntry7"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(canalEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South small trench entrances
	// Choose one to spawn from...
	const southEntrances = ["infEntry8", "infEntry9"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(southEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South large trench entrance
	const STRENCH_FACTORY_DESTROYED = getObject("infFactory") === null;
	const southTrenchData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: (STRENCH_FACTORY_DESTROYED) ? undefined : CAM_HUMAN_PLAYER}};
	camSendReinforcement(CAM_INFESTED, getObject("infEntry10"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, southTrenchData);

	// Southwest corner entrances
	// Only if southwest base is destroyed
	if (camBaseIsEliminated("colMainBase"))
	{
		// Choose one to spawn from...
		const swEntrances = ["infEntry11", "infEntry12", "infEntry13"];
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(swEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}
	
	// West small trench entrance
	// Only if the VTOL base is destroyed
	if (camBaseIsEliminated("colVtolBase"))
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry14"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}

	// Northwest trench entrances
	// Choose one to spawn from...
	const northwestEntrances = ["infEntry15", "infEntry17"];
	camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(northwestEntrances)), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// Northwest small trench entrance
	// Only if the northwest base is destroyed
	if (camBaseIsEliminated("colNorthwestBase"))
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry16"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}

	// North small trench entrance
	// Only if the Infested heavy factory is alive
	if (getObject("infHvyFactory") !== null)
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry18"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}
}

// Activate more factories...
function activateFirstFactories()
{
	camEnableFactory("infHvyFactory"); // Infested vehicle factory
	camEnableFactory("colCybFactory3"); // West cyborg factory
	camEnableFactory("colFactory2"); // Hover factory
	camEnableFactory("cScavFactory1");

	heliAttack();
}

function activateSecondFactories()
{
	camEnableFactory("colFactory3"); // Heavy factory
	camEnableFactory("colCybFactory4"); // Southwest cyborg factory
	camEnableFactory("cScavFactory2");

	// Also order the the eastern commander to attack
	camManageGroup(colCommanderGroup1, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		repair: 75
	})
}

function activateFinalFactories()
{
	camEnableFactory("colVtolFactory2");
	camCallOnce("activateNorthwestBases");
	

	// Also order the the southwest commander to attack
	camManageGroup(colCommanderGroup3, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		repair: 75
	})
}

function camEnemyBaseEliminated_infNorthBase()
{
	camCallOnce("activateNorthwestBases");
}

// Activates the northwest factories and LZ
function activateNorthwestBases()
{
	camEnableFactory("colCybFactory2");
	camEnableFactory("colFactory1");

	sendCollectiveTransporter();
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(8)));
}

function sendCollectiveTransporter()
{
	// First, check if the LZ is still alive
	if (camBaseIsEliminated("colLZBase"))
	{
		// Try again next time...
		return;
	}

	// Next, add grab some droids for the transport
	const TRANSPORT_SIZE = (difficulty <= MEDIUM) ? 8 : 10;
	const droidPool = [
		cTempl.cominft, // Inferno
		cTempl.comagt, // Assault Gun
		cTempl.comacant, // Assault Cannon
		cTempl.cybth, // Thermite Flamer
		cTempl.cybag, // Assault Gunner
		cTempl.scygr, // Super Grenadier
		cTempl.scyac, // Super Auto Cannon
	];
	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("colTransportEntry"),
			exit: camMakePos("colTransportEntry"),
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			}
		}
	);
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L9", {
		ignoreInfestedUnits: true
	});

	camSetArtifacts({
		"colCC": { tech: "R-Sys-Sensor-Upgrade01" }, // Sensor Upgrade
		"colResearch": { tech: "R-Wpn-Howitzer-Accuracy01" }, // Target Acquisition Artillery Shells
		"colFactory3": { tech: "R-Vehicle-Body09" }, // Tiger
		"colVtolFactory2": { tech: "R-Wpn-Bomb02" }, // HEAP Bomb Bay
		"rippleEmp": { tech: "R-Wpn-Rocket06-IDF" }, // Ripple Rockets
	});

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"colEastBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSoutheastBase": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colNorthwestBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colVtolBase": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"cScavWaterBase": {
			cleanup: "cScavBase",
			detectMsg: "CSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"infSouthBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNorthBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colLZBase": {
			cleanup: "colLzStructs",
			detectMsg: "COL_LZBASE",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 65,
				regroup: true
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Half-tracks
			templates: [ cTempl.comhatht, cTempl.comaght, cTempl.comaght, cTempl.comhrepht, cTempl.comhaaht, cTempl.comhpvht ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_PATROL,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 75,
				pos: [
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos4"),
					camMakePos("hoverPatrolPos5"),
					camMakePos("hoverPatrolPos6"),
					camMakePos("hoverPatrolPos7"),
					camMakePos("hoverPatrolPos8")
				],
				interval: camSecondsToMilliseconds(32)
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(125)),
			// Hovers
			templates: [ cTempl.cohbbh, cTempl.comhpvh, cTempl.comhath, cTempl.comhath, cTempl.comhpvh, cTempl.cohhrah ]
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
			// Heavy tanks
			templates: [ cTempl.cohhcant, cTempl.cohhcant, cTempl.cohbbt, cTempl.cohhrat, cTempl.cohhcant ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Super Cyborgs + Assault Gunners
			templates: [ cTempl.scyac, cTempl.cybag, cTempl.cybag ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Super Grenadiers + Thermite Flamers
			templates: [ cTempl.scygr, cTempl.cybth ]
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Rocket cyborgs
			templates: [ cTempl.cybla, cTempl.scytk, cTempl.cybla ]
		},
		"colCybFactory4": {
			assembly: "colCybAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			// Super cannons/grenadiers
			templates: [ cTempl.scyac, cTempl.scygr ]
		},
		"colVtolFactory1": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Lancers + Assault Cannons
			templates: [ cTempl.colatv, cTempl.comacanv ]
		},
		"colVtolFactory2": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(125)),
			// Bomber spam
			templates: [ cTempl.comhbombv, cTempl.colphosv ]
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			// Basic vehicles + infantry
			templates: [ cTempl.bjeep, cTempl.rbjeep, cTempl.kevbloke, cTempl.buscan, cTempl.firetruck, cTempl.kevlance ]
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			// Cool stuff
			templates: [ cTempl.monlan, cTempl.gbjeep, cTempl.monhmg, cTempl.flatmrl, cTempl.flatat, cTempl.moncan, cTempl.minitruck ]
		},
		"infFactory": {
			assembly: "infAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Misc. scav vehicles
			templates: [cTempl.infgbjeep, cTempl.infmonhmg, cTempl.infkevbloke, cTempl.infflatmrl, cTempl.infmonlan, cTempl.infminitruck, cTempl.infflatat]
		},
		"infCybFactory": {
			assembly: "infCybAssembly",
			order: CAM_ORDER_ATTACK,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.infcybca, cTempl.infcybgr, cTempl.infcybhg, cTempl.infscymc, cTempl.infcybla ]
		},
		"infHvyFactory": {
			assembly: "infHvyAssembly",
			order: CAM_ORDER_ATTACK,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.infcommcant, cTempl.infcomatt, cTempl.infcolpodt, cTempl.infcomhmgt, cTempl.infcommcant ]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colEastBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck1"),
		structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSoutheastBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck2"),
		structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colNorthwestBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck3"),
		structset: camAreaToStructSet("colBase3")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colVtolBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck4"),
		structset: camAreaToStructSet("colBase4")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colMainBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		truckDroid: getObject("colTruck5"),
		structset: camAreaToStructSet("colBase5")
	});
	camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colLZBase",
		respawnDelay: TRUCK_TIME,
		rebuildBase: tweakOptions.rec_timerlessMode,
		structset: camAreaToStructSet("colLzStructs"),
		truckDroid: getObject("colTruckLz")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		// Cranes and more trucks...
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(60));
		camManageTrucks(CAM_THE_COLLECTIVE, {
			label: "cScavWaterBase",
			rebuildBase: true,
			respawnDelay: CRANE_TIME,
			template: cTempl.crane,
			structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct)))
		});
		// Main base (again)
		camManageTrucks(CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase5")
		});
		if (difficulty >= HARD)
		{
			// Another Crane for the scav base
			camManageTrucks(CAM_THE_COLLECTIVE, {
				label: "cScavWaterBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct)))
			});
			// Another truck for the VTOL base
			camManageTrucks(CAM_THE_COLLECTIVE, {
				label: "colVtolBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: tweakOptions.rec_timerlessMode,
				template: cTempl.comtruckt,
				structset: camAreaToStructSet("colBase4")
			});
		}
		if (difficulty === INSANE)
		{
			// A THIRD truck for the main base!!!
			camManageTrucks(CAM_THE_COLLECTIVE, {
				label: "colMainBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: tweakOptions.rec_timerlessMode,
				template: cTempl.comtruckt,
				structset: camAreaToStructSet("colBase5")
			});
		}
	}
	else
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.75)));
	}

	// Rank and assign the Collective commanders
	// Set the commanders' rank 
	// Ranges from Trained to Professional:
	camSetDroidRank(getObject("colCommander1"), (difficulty <= EASY) ? 2 : (difficulty));
	colCommanderGroup1 = camMakeGroup("colCommander1");
	// Ranges from Professional to Elite:
	camSetDroidRank(getObject("colCommander2"), (difficulty <= EASY) ? 4 : (difficulty + 2));
	colCommanderGroup2 = camMakeGroup("colCommander2");
	// Ranges from Elite to Hero:
	camSetDroidRank(getObject("colCommander3"), (difficulty <= EASY) ? 6 : (difficulty + 4));
	colCommanderGroup3 = camMakeGroup("colCommander3");

	// Give the commanders orders and assign their subordinates
	// East base commander:
	camManageGroup(colCommanderGroup1, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(32),
		repair: 75
	});
	camMakeRefillableGroup(camMakeGroup("colCommandGroup1"), {
		templates: [
			cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 4 Super Auto-Cannons
			cTempl.comagt, cTempl.comagt, // 2 Assault Guns
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.comhaat, // 1 Cyclone
			cTempl.comhrept, // 1 Heavy Repair Turret
		],
		factories: ["colFactory2", "colFactory3", "colCybFactory3", "colCybFactory1"],
		obj: "colCommander1" // Stop refilling this group when the commander dies
	}, CAM_ORDER_FOLLOW, {
		leader: "colCommander1",
		repair: 50,
		suborder: CAM_ORDER_ATTACK,
		targetPlayer: CAM_HUMAN_PLAYER
	});

	// VTOL base commander:
	camManageGroup(colCommanderGroup2, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 75
	});
	camMakeRefillableGroup(camMakeGroup("colCommandGroup2"), {
		templates: [
			cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killers
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
			cTempl.cohraat, // 1 Whirlwind
			cTempl.comhrept, // 2 Heavy Repair Turrets
			cTempl.comstriket, // 1 Sensor Turret
		],
		factories: ["colFactory2", "colFactory3", "colCybFactory3"],
		obj: "colCommander2"
	}, CAM_ORDER_FOLLOW, {
		leader: "colCommander2",
		repair: 50,
		suborder: CAM_ORDER_ATTACK,
		targetPlayer: CAM_HUMAN_PLAYER
	});

	// Southwest base commander:
	camManageGroup(colCommanderGroup3, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos7"),
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 75
	});
	camMakeRefillableGroup(camMakeGroup("colCommandGroup3"), {
		templates: [
			cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
			cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
			cTempl.comagt, cTempl.comagt, // 2 Assault Guns
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
			cTempl.comhrept, // 1 Heavy Repair Turret
			cTempl.comstriket, // 1 VTOL Strike Turret
		],
		factories: ["colFactory2", "colFactory3"],
		obj: "colCommander3"
	}, CAM_ORDER_FOLLOW, {
		leader: "colCommander3",
		repair: 50,
		suborder: CAM_ORDER_ATTACK,
		targetPlayer: CAM_HUMAN_PLAYER
	});

	// Also assign a refillable hover group
	colHoverGroup = camMakeRefillableGroup(camMakeGroup("colHoverPatrolGroup"), {
		templates: [
			cTempl.cohhrah, cTempl.cohhrah, cTempl.cohhrah, cTempl.cohhrah, // 4 HRAs
			cTempl.comhath, cTempl.comhath, cTempl.comhath, cTempl.comhath, // 4 Tank Killers
		],
		factories: ["colFactory2"]
	}, CAM_ORDER_PATROL, {
		repair: 75,
		pos: [
			camMakePos("hoverPatrolPos1"),
			camMakePos("hoverPatrolPos2"),
			camMakePos("hoverPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(22)
	});

	// Manage Collective VTOL groups...
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Assault Guns, 2 Phosphor Bombs
			cTempl.colagv, cTempl.colphosv,
			cTempl.colagv, cTempl.colphosv,
		],
		globalFill: true,
		obj: "colVtolTower1", // East base tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower1",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
		}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 4 Assault Guns, 2 Assault Cannons
			cTempl.colagv, cTempl.colagv, cTempl.comacanv,
			cTempl.colagv, cTempl.colagv, cTempl.comacanv,
		],
		globalFill: true,
		obj: "colVtolTower2", // Southeast outpost tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower2",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 4 Tank Killers, 2 Phosphor Bombs
			cTempl.comhatv, cTempl.comhatv, cTempl.colphosv,
			cTempl.comhatv, cTempl.comhatv, cTempl.colphosv,
		],
		globalFill: true,
		obj: "colVtolTower3", // VTOL base tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower3",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 4 Assault Cannons, 2 Tank Killers
			cTempl.comacanv, cTempl.comacanv, cTempl.comhatv,
			cTempl.comacanv, cTempl.comacanv, cTempl.comhatv,
		],
		globalFill: true,
		obj: "colVtolTower4", // Southwest base tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower4",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Tank Killers, 2 Assault Cannons
			cTempl.comhatv, cTempl.comacanv,
			cTempl.comhatv, cTempl.comacanv,
		],
		globalFill: true,
		obj: "colVtolCBTower1", // Northwest base CB tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower1",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Tank Killers, 2 Assault Cannons
			cTempl.comhatv, cTempl.comacanv,
			cTempl.comhatv, cTempl.comacanv,
		],
		globalFill: true,
		obj: "colVtolCBTower2", // VTOL base CB tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower2",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 2 Tank Killers, 4 Assault Cannons
			cTempl.comhatv, cTempl.comacanv, cTempl.comacanv,
			cTempl.comhatv, cTempl.comacanv, cTempl.comacanv,
		],
		globalFill: true,
		obj: "colVtolCBTower3", // Southwest base CB tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower3",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(undefined, {
		templates: [ // 4 Tank Killers, 2 Assault Cannons, 4 Thermite Bombs
			cTempl.comhatv, cTempl.comhatv, cTempl.comacanv, cTempl.comthermv, cTempl.comthermv,
			cTempl.comhatv, cTempl.comhatv, cTempl.comacanv, cTempl.comthermv, cTempl.comthermv,
		],
		globalFill: true,
		obj: "colVtolSensor", // VTOL Strike Turret assigned to a commander
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolSensor",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});

	camAutoReplaceObjectLabel("heliTower");
	// Start these factories immediately...
	camEnableFactory("infFactory");
	camEnableFactory("infCybFactory");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colVtolFactory1");

	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(12)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(60)));
	infHeliAttack();

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