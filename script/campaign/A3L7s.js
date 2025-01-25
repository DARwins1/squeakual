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
const infEntry1 = {x: 106, y: 1, x2: 111, y2: 2};
const infEntry2 = {x: 128, y: 1, x2: 133, y2: 2};
const infEntry3 = {x: 197, y: 6, x2: 198, y2: 11};
const infEntry4 = {x: 197, y: 21, x2: 198, y2: 25};
const infEntry5 = {x: 197, y: 94, x2: 198, y2: 100};
const infEntry6 = {x: 197, y: 117, x2: 198, y2: 121};
const infEntry7 = {x: 157, y: 133, x2: 160, y2: 134};
const infEntry8 = {x: 134, y: 133, x2: 137, y2: 134};
const infEntry9 = {x: 108, y: 133, x2: 116, y2: 134};
const infEntry10 = {x: 83, y: 133, x2: 87, y2: 134};

function sendInfestedReinforcements()
{	
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;

	const coreDroids = [
		cTempl.stinger, cTempl.stinger, cTempl.stinger,
		cTempl.infbloke,  cTempl.infbloke,
		cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
		cTempl.infminitruck, cTempl.infminitruck,
		cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy,
		cTempl.infrbuggy, cTempl.infrbuggy, cTempl.infrbuggy,
		cTempl.infcybhg, cTempl.infcybhg,
		cTempl.infcybca, cTempl.infcybca,
		cTempl.infcolpodt, cTempl.infcolpodt,
		cTempl.basher, cTempl.basher,
		cTempl.inflance,
		cTempl.boomtick,
	];

	// North trench entrances
	// Choose one to spawn from...
	const northEntrances = [infEntry1, infEntry2];
	const northTrenchEntrance = getObject(northEntrances[camRand(northEntrances.length)]);
	camSendReinforcement(CAM_INFESTED, northTrenchEntrance, camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// North east entrances
	// Choose one to spawn from...
	const neEntrances = [infEntry3, infEntry4];
	const northeastEntrance = getObject(neEntrances[camRand(neEntrances.length)]);
	camSendReinforcement(CAM_INFESTED, northeastEntrance, camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South east entrances
	// Choose one to spawn from...
	const seEntrances = [infEntry5, infEntry6];
	const southeastEntrance = getObject(seEntrances[camRand(seEntrances.length)]);
	camSendReinforcement(CAM_INFESTED, southeastEntrance, camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South canal entrances
	const canalEntrances = [infEntry7, infEntry8];
	const canalEntrance = getObject(canalEntrances[camRand(canalEntrances.length)]);
	camSendReinforcement(CAM_INFESTED, canalEntrance, camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

	// South west trench entrances
	// Choose one to spawn from...
	const swEntrances = [infEntry9, infEntry10];
	const southwestEntrance = getObject(swEntrances[camRand(swEntrances.length)]);
	camSendReinforcement(CAM_INFESTED, southwestEntrance, camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
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
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A3L7");

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

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(115)));

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}