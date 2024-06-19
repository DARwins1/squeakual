include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

var allowWin;
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02", "R-Sys-Engineering01",
];

//Remove enemy vtols when in the remove zone area.
function checkEnemyVtolArea()
{
	const pos = {x: 16, y: 2};
	const vtols = enumRange(pos.x, pos.y, 2, CAM_THE_COLLECTIVE, false).filter((obj) => (isVTOL(obj)));

	for (let i = 0, l = vtols.length; i < l; ++i)
	{
		if ((vtols[i].weapons[0].armed < 20) || (vtols[i].health < 60))
		{
			camSafeRemoveObject(vtols[i], false);
		}
	}
}

// Bring in Collective and Collective-affiliated scavengers
function collectiveAttackWaves()
{
	waveIndex++;

	/*
		The waves of Collective and C-Scav units will spawn 8 different "entrances" around the edges of the map
		As the level progresses, more entrances will "activate", allowing enemies to spawn from those.
		Each wave, a set number of random entrances will spawn units, with the number of entrances being chosen depending on the difficulty
		> Waves 1+ will activate the northwest ridge and south entrances 
		> Waves 3+ will activate the north city entrance
		> Waves 6+ will activate the northeast valley entrance
		> Waves 10+ will activate the northeast plateau entrance
		> Waves 14+ will activate the east plateau entrance
		> Waves 18+ will activate the northwest crater entrance
		> Waves 22+ will activate the east valley entrance
	*/

	// Each entrance has a unit set composition, mostly of C-Scavs. 
	const nwRidgeDroids = [cTempl.bloke, cTempl.buggy, cTempl.buscan, cTempl.lance, cTempl.rbuggy];

	const northCityDroids = [cTempl.moncan, cTempl.rbjeep, cTempl.bloke, cTempl.bjeep, cTempl.lance];

	const neValleyDroids = [cTempl.firetruck, cTempl.gbjeep, cTempl.lance, cTempl.trike, cTempl.monsar];

	const nePlateauDroids = [cTempl.bjeep, cTempl.minitruck, cTempl.buscan, cTempl.monhmg, cTempl.sartruck];

	const eastPlateauDroids = [cTempl.flatmrl, cTempl.gbjeep, cTempl.bloke, cTempl.lance, cTempl.buggy, cTempl.rbuggy];

	const nwCraterDroids = [cTempl.monmrl, cTempl.gbjeep, cTempl.minitruck, cTempl.lance, cTempl.bjeep];

	const eastValleyDroids = [cTempl.flatat, cTempl.minitruck, cTempl.gbjeep, cTempl.trike, cTempl.moncan];

	const southDroids = [cTempl.moncan, cTempl.bjeep, cTempl.bloke, cTempl.minitruck, cTempl.flatmrl, cTempl.buggy];

	// Occasionally, entrance templates will be overwritten with these purely Collective units.
	const colOverrideDroids = [
		cTempl.colpodt, cTempl.colpodt, // MRP
		cTempl.colmrat, cTempl.colmrat, // MRA
		cTempl.colhmght, cTempl.colhmght, // HMG
		cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, // Light Cannon
		cTempl.colflamt, cTempl.colflamt, // Flamer
		cTempl.colaaht, // Hurricane
	];
	if (phaseTwo) colOverrideDroids.push(cTempl.commcant); // Add chance for Medium Cannon
	if (difficulty >= HARD) colOverrideDroids.push(cTempl.commcant); // Add chance for Medium Cannon
	if (difficulty === INSANE) colOverrideDroids.push(cTempl.comatt); // Add chance for Lancer

	// This block handles activating new entrances
	const waveEntrances = [];
	const waveTemplates = [];
	if (waveIndex >= 1)
	{
		waveEntrances.push("colEntrance1");
		waveTemplates.push(nwRidgeDroids);
		waveEntrances.push("colEntrance8");
		waveTemplates.push(southDroids);
	}
	if (waveIndex >= 3)
	{
		waveEntrances.push("colEntrance2");
		waveTemplates.push(northCityDroids);
	}
	if (waveIndex >= 6)
	{
		waveEntrances.push("colEntrance3");
		waveTemplates.push(neValleyDroids);
	}
	if (waveIndex >= 10)
	{
		waveEntrances.push("colEntrance4");
			waveTemplates.push(nePlateauDroids);
	}
	if (waveIndex >= 14)
	{
		waveEntrances.push("colEntrance5");
		waveTemplates.push(eastPlateauDroids);
	}
	if (waveIndex >= 18)
	{
		waveEntrances.push("colEntrance6");
		waveTemplates.push(nwCraterDroids);
	}
	if (waveIndex >= 22)
	{
		waveEntrances.push("colEntrance7");
		waveTemplates.push(eastValleyDroids);
	}

	// Determine the number of separate groups to spawn at once
	let numGroups = 2;
	if (difficulty >= MEDIUM) numGroups++; // 3 on Normal
	if (difficulty >= HARD) numGroups++; // 4 on Hard
	if (difficulty >= INSANE) numGroups++; // 5 on Insane

	// Determine how many groups should be replaced with stronger Collective templates
	let numColOverrides = 0;
	if (waveIndex >= 6 && waveIndex % 3 == 0)
	{
		numColOverrides++;
		if (difficulty === INSANE) numColOverrides++;
	}
	if (waveIndex >= 16 && waveIndex % 2 == 0)
	{
		numColOverrides++;
	}
	if (phaseTwo)
	{
		numColOverrides++;
	}

	// Choose from among the active entrances and spawn units
	const chosenEntrances = [];
	const chosenTemplates = [];
	for (let i = 0; i < Math.min(waveEntrances.length, numGroups); i++)
	{
		const INDEX = camRand(waveEntrances.length);

		chosenEntrances.push(waveEntrances[INDEX]);
		waveEntrances.splice(INDEX, 1);
		if (numColOverrides > 0)
		{
			chosenTemplates.push(colOverrideDroids);
			numColOverrides--;
		}
		else
		{
			chosenTemplates.push(waveTemplates[INDEX]);
			waveTemplates.splice(INDEX, 1);
		}
	}

	// Spawn units at the chosen entrance(s) with the corresponding templates
	const NUM_DROIDS = difficulty + 3;
	for (let i = 0; i < chosenEntrances.length; i++)
	{
		const droids = [];
		for (let j = 0; j < NUM_DROIDS; j++)
		{
			const templateList = chosenTemplates[i];
			droids.push(templateList[camRand(templateList.length)]);
		}

		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(chosenEntrances[i]), droids, CAM_REINFORCE_GROUND, {
			data: {targetPlayer: MIS_CLAYDE}
		});
	}

	// Lastly, send a truck to attempt building a Collective LZ
	// NOTE: During phase two, trucks are sent every other wave
	if (!camDef(camGetTrucksFromLabel("colLZ1")[0]) && waveIndex >= 8 && (waveIndex % 4 == 0 || (phaseTwo && waveIndex % 2 == 0)))
	{
		const tPos = camMakePos("colEntrance5");
		const tTemp = (phaseTwo || difficulty === INSANE) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = addDroid(CAM_THE_COLLECTIVE, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, colTruckJob1);
	}
	if (!camDef(camGetTrucksFromLabel("colLZ2")[0]) && waveIndex >= 16 && (waveIndex % 8 == 0 || (phaseTwo && waveIndex % 2 == 0)))
	{
		const tPos = camMakePos("colEntrance4");
		const tTemp = (phaseTwo || difficulty >= HARD) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = addDroid(CAM_THE_COLLECTIVE, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, colTruckJob2);
	}
	if (!camDef(camGetTrucksFromLabel("colLZ3")[0]) && waveIndex >= 24 && (waveIndex % 6 == 0 || (phaseTwo && waveIndex % 2 == 0)))
	{
		const tPos = camMakePos("colEntrance7");
		const tTemp = (phaseTwo || difficulty >= MEDIUM) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = addDroid(CAM_THE_COLLECTIVE, tPos.x, tPos.y, 
			camNameTemplate(tTemp.weap, tTemp.body, tTemp.prop), 
			tTemp.body, tTemp.prop, "", "", tTemp.weap);
		camAssignTruck(newTruck, colTruckJob3);
	}
}

// This entire mission is basically just sending attack waves over and over until the player loses/evacuates all of their stuff
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_EVACUATE, "THE_END", {
		reinforcements: camMinutesToSeconds(7), // Duration the transport "leaves" map.
		callback: "checkIfLaunched"
	});
	camSetExtraObjectiveMessage(_("Evacuate as many transports as possible"));

	centreView(46, 11);
	setNoGoArea(45, 10, 47, 12, CAM_HUMAN_PLAYER);
	camSetupTransporter(46, 11, 98, 62);

	// setMissionTime(camMinutesToSeconds(30));
	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);

	allowWin = false;
	// camPlayVideos([{video: "MB2_DII_MSG", type: CAMP_MSG}, {video: "MB2_DII_MSG2", type: MISS_MSG}]);

	queue("vtolAttack", camChangeOnDiff(camSecondsToMilliseconds(30)));
	setTimer("collectiveAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(45)));
	setTimer("checkEnemyVtolArea", camSecondsToMilliseconds(1));
}