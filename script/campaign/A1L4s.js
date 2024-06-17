include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(46, 11, 34, 2);
	centreView(46, 11);
	setNoGoArea(45, 10, 47, 12, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A1L4");

	// In case the player didn't get this in the last mission
	enableResearch("R-Wpn-MG3Mk1", CAM_HUMAN_PLAYER);

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set the fog to it's default colours
	// camSetFog(182, 225, 236);
}