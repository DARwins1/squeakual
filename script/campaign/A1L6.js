include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

var allowWin;
var savedPower;
var waveIndex;
var colTruckJob1;
var colTruckJob2;
var colTruckJob3;
var colTruckJob4;
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02", "R-Sys-Engineering01",
];
const vtolRemovePos = {x: 16, y: 2};

//Remove enemy vtols when in the remove zone area.
function checkEnemyVtolArea()
{
	const vtols = enumRange(vtolRemovePos.x, vtolRemovePos.y, 2, CAM_THE_COLLECTIVE, false).filter((obj) => (isVTOL(obj)));

	for (let i = 0, l = vtols.length; i < l; ++i)
	{
		if ((vtols[i].weapons[0].armed < 20) || (vtols[i].health < 60))
		{
			camSafeRemoveObject(vtols[i], false);
		}
	}
}

// Helicoptors and VTOLs and Tanks oh my!
function heliAttack()
{
	const list = [cTempl.helcan, cTempl.helhmg, cTempl.helpod];
	const ext = {
		limit: [1, 1, 1],
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, undefined, vtolRemovePos, list, camChangeOnDiff(camSecondsToMilliseconds(25)), undefined, ext);
}

// Hit-and-run VTOLs
function vtolAttack()
{
	let vtolPositions = [
		"vtolAttackPos1",
		"vtolAttackPos2",
		"vtolAttackPos3",
		"vtolAttackPos4",
		"vtolAttackPos5",
	];
	
	if (difficulty === INSANE)
	{
		vtolPositions = undefined; // Randomize the spawns each time
	}

	const list = [cTempl.colatv, cTempl.colhmgv];
	if (difficulty >= HARD) list.push(cTempl.colbombv); // Cluster Bombs
	const ext = {
		minVTOLs: (difficulty >= HARD) ? 3 : 2,
		maxRandomVTOLs: (difficulty >= MEDIUM) ? ((difficulty >= HARD) ? 2 : 1) : 0
	};

	camSetVtolData(CAM_THE_COLLECTIVE, vtolPositions, vtolRemovePos, list, camChangeOnDiff(camSecondsToMilliseconds(60)), undefined, ext);
}

// Bring in Collective and C-Scav units.
function collectiveAttackWaves()
{
	waveIndex++;

	// There are 10 entrances on the map, every 2 waves enables a new entrace, with each getting progressively closer 
	// to the player's LZ.

	// Each entrance shares a C-Scav and a Collective pool.
	// Each attack wave can draw from either pool.
	const cScavDroidPool = [ // NOTE: Templates that appear multiple times are more common
		cTempl.bloke, cTempl.bloke, cTempl.bloke,
		cTempl.lance, cTempl.lance,
		cTempl.trike, cTempl.trike,
		cTempl.buggy, cTempl.buggy, cTempl.buggy,
		cTempl.rbuggy, cTempl.rbuggy,
		cTempl.bjeep, cTempl.bjeep,
		cTempl.rbjeep, cTempl.rbjeep,
		cTempl.gbjeep, cTempl.gbjeep, cTempl.gbjeep,
		cTempl.buscan, cTempl.buscan,
		cTempl.firetruck, cTempl.firetruck,
		cTempl.minitruck, cTempl.minitruck,
		cTempl.sartruck, cTempl.sartruck,
		cTempl.moncan,
		cTempl.monhmg,
		cTempl.flatmrl,
	];
	// cTempl.colpodt // MRP
	// cTempl.colaaht // Hurricane
	// cTempl.colmrat // MRA
	// cTempl.colhmght // HMG
	// cTempl.colcanht // Light Cannon
	// cTempl.colflamt // Flamer
	// cTempl.colmortht // Mortar
	// cTempl.commcant // Medium Cannon
	// cTempl.comatt // Lancer
	const colDroidPool = [
		cTempl.colpodt, cTempl.colpodt, // MRP
		cTempl.colmrat, cTempl.colmrat, // MRA
		cTempl.colhmght, cTempl.colhmght, // HMG
		cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, // Light Cannon
		cTempl.colflamt, cTempl.colflamt, // Flamer
		cTempl.colaaht, // Hurricane
		cTempl.commcant, // Medium Cannon
		cTempl.comatt, // Lancer
	];

	// This block handles activating new entrances
	const waveEntrances = [];
	if (waveIndex >= 1)
	{
		waveEntrances.push("colEntrance1");
	}
	if (waveIndex >= 3)
	{
		waveEntrances.push("colEntrance2");
	}
	if (waveIndex >= 5)
	{
		waveEntrances.push("colEntrance3");
	}
	if (waveIndex >= 7)
	{
		waveEntrances.push("colEntrance4");
	}
	if (waveIndex >= 9)
	{
		waveEntrances.push("colEntrance5");
	}
	if (waveIndex >= 11)
	{
		waveEntrances.push("colEntrance6");
	}
	if (waveIndex >= 13)
	{
		waveEntrances.push("colEntrance7");
	}
	if (waveIndex >= 15)
	{
		waveEntrances.push("colEntrance8");
	}
	if (waveIndex >= 17)
	{
		waveEntrances.push("colEntrance9");
	}
	if (waveIndex >= 19)
	{
		waveEntrances.push("colEntrance10");
	}

	// Determine the number of separate groups to spawn at once
	let numGroups = 2;
	if (difficulty >= MEDIUM) numGroups++; // 3 on Normal
	if (difficulty >= HARD) numGroups++; // 4 on Hard
	if (difficulty >= INSANE) numGroups++; // 5 on Insane

	// Choose from among the active entrances and spawn units
	const chosenEntrances = [];
	for (let i = 0; i < Math.min(waveEntrances.length, numGroups); i++)
	{
		const INDEX = camRand(waveEntrances.length);

		chosenEntrances.push(waveEntrances[INDEX]);
		waveEntrances.splice(INDEX, 1);
	}

	// Spawn units at the chosen entrance(s)
	const NUM_DROIDS = difficulty + 6;
	for (let i = 0; i < chosenEntrances.length; i++)
	{
		const droids = [];
		for (let j = 0; j < NUM_DROIDS; j++)
		{
			// Choose either Collective or C-Scav templates
			const templatePool = (camRand(40) < waveIndex) ? colDroidPool : cScavDroidPool;
			droids.push(templatePool[camRand(templatePool.length)]);
		}

		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(chosenEntrances[i]), droids, CAM_REINFORCE_GROUND);
	}

	// Next, send a truck to attempt building a Collective LZ
	if (!camDef(camGetTrucksFromLabel("colNorthLZ")[0]) && waveIndex >= 8 && (waveIndex % 4 == 0))
	{
		const tPos = camMakePos("colEntrance4");
		const tTemp = (waveIndex >= 16 || difficulty === INSANE) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = addDroid(CAM_THE_COLLECTIVE, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, colTruckJob1);
	}
	if (!camDef(camGetTrucksFromLabel("colEastLZ")[0]) && waveIndex >= 16 && (waveIndex % 8 == 0))
	{
		const tPos = camMakePos("colEntrance3");
		const tTemp = (waveIndex >= 24 || difficulty >= HARD) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = addDroid(CAM_THE_COLLECTIVE, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, colTruckJob2);
	}
	if (!camDef(camGetTrucksFromLabel("colSouthLZ")[0]) && waveIndex >= 24 && (waveIndex % 6 == 0))
	{
		const tPos = camMakePos("colEntrance6");
		const tTemp = (waveIndex >= 32 || difficulty >= MEDIUM) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = addDroid(CAM_THE_COLLECTIVE, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, colTruckJob3);
	}
	if (!camDef(camGetTrucksFromLabel("colSWLZ")[0]) && waveIndex >= 32 && (waveIndex % 8 == 0))
	{
		const tPos = camMakePos("colEntrance9");
		const tTemp = (waveIndex >= 40 || difficulty >= EASY) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = addDroid(CAM_THE_COLLECTIVE, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, colTruckJob4);
	}

	// Lastly, start spawning more waves of enemies over time.
	// This will cause the Collective to become overwhelming after a while.
	if (waveIndex % 12 === 0)
	{
		// Increase the number of VTOLs every 12 waves
		vtolAttack();
	}
	if (waveIndex % 6 === 0)
	{
		// Increase the number of Helicopters every 6 waves
		heliAttack();
	}
	if (waveIndex % 16 === 0)
	{
		// Increase the number of ground attacks every 16 waves
		setTimer("collectiveAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(45)));
		// NOTE: Since the above increases are based on the number of ground waves, not only will the
		// number of enemies increase over time, but the RATE that they increase will get faster too!
	}
}

// Land extra Collective tanks at a random built LZ
function sendCollectiveTransporter()
{
	// Set reinforcement droids
	const droidPool = [
		cTempl.colpodt, cTempl.colpodt,
		cTempl.colcanht, cTempl.colcanht,
		cTempl.colhmght, cTempl.colhmght,
		cTempl.colflamt, cTempl.colflamt,
		cTempl.colmrat, cTempl.colmrat,
		cTempl.commcant,
		cTempl.comatt,
	];

	const droids = [];
	for (let i = 0; i < 10; i++)
	{
		droids.push(droidPool[camRand(droidPool.length)]);
	}

	// Get all available LZs
	const lzPool = [];
	if (!camBaseIsEliminated("colNorthLZ")) lzPool.push(camMakePos("colLZ1"));
	if (!camBaseIsEliminated("colEastLZ")) lzPool.push(camMakePos("colLZ2"));
	if (!camBaseIsEliminated("colSouthLZ")) lzPool.push(camMakePos("colLZ3"));
	if (!camBaseIsEliminated("colSWLZ")) lzPool.push(camMakePos("colLZ4"));

	// If we have a valid LZ, send the transport
	if (lzPool.length > 0)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, lzPool[camRand(lzPool.length)], droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camGenerateRandomMapEdgeCoordinate(),
				exit: camGenerateRandomMapEdgeCoordinate(),
			}
		);
	}
}

// Allow a win if a transporter was launched.
// NOTE: The player doesn't have to transport a construction droid, since trucks will be given
// to the player at the start of Act II.
// Also, take up to 1 thousand of the player's power and stash it for the next mission.
function eventTransporterLaunch(transporter)
{
	if (transporter.player === CAM_HUMAN_PLAYER)
	{
		allowWin = true;

		// Stash away up to 1k power every time the player launches a transport
		const POWER_PER_TRANSPORT = 1000;
		const CURRENT_POWER = playerPower(CAM_HUMAN_PLAYER);

		savedPower = Math.min(CURRENT_POWER, POWER_PER_TRANSPORT);
		setPower(Math.max(CURRENT_POWER - POWER_PER_TRANSPORT, 0), CAM_HUMAN_PLAYER);
	}
}

function checkIfLaunched()
{
	// Set the player's power to whatever they've managed to stash
	setPower(savedPower, CAM_HUMAN_PLAYER);

	if (allowWin)
	{
		// camCallOnce("playLastVideo");
		return true;
	}
	return false;
}

// This entire mission is basically just sending attack waves over and over until the player loses/evacuates all of their stuff.
// It's basically impossible for the player to truly "lose" this level. Instead, the player has to focus on saving as many of their units/resources as possible
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_TIMEOUT, "THE_END", {
		reinforcements: camMinutesToSeconds(5), // Duration the transport "leaves" map.
		gameOverOnDeath: false, // Don't fail when the player runs out of stuff
		callback: "checkIfLaunched"
	});
	camSetExtraObjectiveMessage(_("Evacuate as many transports as possible"));
	setMissionTime(-1); // Infinite time

	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");
	const entryPos = camMakePos("transportEntryPos")

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	camSetupTransporter(startPos.x, startPos.y, entryPos.x, entryPos.y);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	// Collective LZs
	camSetEnemyBases({
		"colNorthLZ": {
			cleanup: "colLZBaseArea1",
			detectMsg: "COL_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colEastLZ": {
			cleanup: "colLZBaseArea2",
			detectMsg: "COL_LZBASE2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSouthLZ": {
			cleanup: "colLZBaseArea3",
			detectMsg: "COL_LZBASE3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSWLZ": {
			cleanup: "colLZBaseArea4",
			detectMsg: "COL_LZBASE4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	// Collective trucks
	colTruckJob1 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colNorthLZ",
		rebuildBase: true,
		structset: camA1L6ColLZ1Structs
	});
	colTruckJob2 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colEastLZ",
		rebuildBase: true,
		structset: camA1L6ColLZ2Structs
	});
	colTruckJob3 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSouthLZ",
		rebuildBase: true,
		structset: camA1L6ColLZ3Structs
	});
	colTruckJob4 = camManageTrucks(CAM_THE_COLLECTIVE, {
		label: "colSWLZ",
		rebuildBase: true,
		structset: camA1L6ColLZ4Structs
	});

	allowWin = false;
	savedPower = 0;
	waveIndex = 0;
	// camPlayVideos([{video: "MB2_DII_MSG", type: CAMP_MSG}, {video: "MB2_DII_MSG2", type: MISS_MSG}]);

	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	setTimer("collectiveAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(45)));
	setTimer("checkEnemyVtolArea", camSecondsToMilliseconds(1));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(2)));
}