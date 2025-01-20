include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

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
const infEntry1 = {x: 196, y: 7, x2: 197, y2: 10};
const infEntry2 = {x: 196, y: 22, x2: 197, y2: 25};
const infEntry3 = {x: 157, y: 76, x2: 160, y2: 77};
// const infEntry4 = {x: 134, y: 76, x2: 138, y2: 77};
// const infEntry5 = {x: 102, y: 76, x2: 104, y2: 77};
// const infEntry6 = {x: 82, y: 49, x2: 83, y2: 53};
const infEntry7 = {x: 129, y: 2, x2: 133, y2: 3};
const infEntry8 = {x: 107, y: 2, x2: 111, y2: 3};
// const infEntry9 = {x: 82, y: 7, x2: 83, y2: 10};

function sendInfestedReinforcements()
{	
	const CORE_SIZE = 4 + camRand(5);
	const FODDER_SIZE = 12 + camRand(3);

	// North east entrances
	// Choose one to spawn from...
	let northeastEntrance;
	switch (camRand(2))
	{
	case 0:
		// Road entrance
		northeastEntrance = infEntry1;
		break;
	case 1:
		// Trench entrance
		northeastEntrance = infEntry2;
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
	camSendReinforcement(CAM_INFESTED, infEntry3, canalDroids, CAM_REINFORCE_GROUND);

	// North trench entrances
	// Choose one to spawn from...
	let northTrenchEntrance;
	switch (camRand(2))
	{
	case 0:
		// Road entrance
		northTrenchEntrance = infEntry7;
		break;
	case 1:
		// Trench entrance
		northTrenchEntrance = infEntry8;
		break;
	}
	const nTrenchDroids = camRandInfTemplates(
		[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infcybhg, cTempl.infcybca, cTempl.infcolpodt], 
		CORE_SIZE, FODDER_SIZE
	);
	camSendReinforcement(CAM_INFESTED, northTrenchEntrance, nTrenchDroids, CAM_REINFORCE_GROUND);
}

function eventStartLevel()
{
	camSetupTransporter(193, 73, 196, 60);
	centreView(193, 73);
	setNoGoArea(192, 72, 194, 74, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(35)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A3L5");

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set the fog to it's default colours
	// camSetFog(182, 225, 236);

	// Placeholder for the actual briefing sequence
	// camQueueDialogue([
	// 	{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
	// 	{text: "LIEUTENANT: General, sir, Commander Bravo has secured the area around team Charlie's base.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Right on time, I have a new objective for them.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: We've received a distress signal from team Delta.", delay: 2, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: It seems that that their base may have been overrun by the Collective.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Commander Bravo, send a scout team to the outskirts of their base.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: Find and relieve team Delta, and await further instructions.", delay: 3, sound: CAM_RCLICK},
	// 	{text: "LIEUTENANT: General, sir, has their been any transmission from team Echo?", delay: 3, sound: CAM_RCLICK},
	// 	{text: "CLAYDE: No... and that's what concerns me the most.", delay: 3, sound: CAM_RCLICK},
	// ]);

	// In case the player didn't get this in the last mission
	enableResearch("R-Wpn-Cannon5", CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(95)));

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}