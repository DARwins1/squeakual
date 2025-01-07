include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(101, 116, 118, 118);
	centreView(101, 116);
	setNoGoArea(100, 115, 102, 117, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(0.5)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A2L2");

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set the fog to it's default colours
	// camSetFog(182, 225, 236);

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "LIEUTENANT: General, sir, Commander Bravo has secured the area around team Charlie's base.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Right on time, I have a new objective for them.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We've received a distress signal from team Delta.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: It seems that that their base may have been overrun by the Collective.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, send a scout team to the outskirts of their base.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Find and relieve team Delta, and await further instructions.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: General, sir, has their been any transmission from team Echo?", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: No... and that's what concerns me the most.", delay: 3, sound: CAM_RCLICK},
	]);

	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	// Add a pinch of darker and gritty blue
	camSetSunIntensity(.45, .45, .5);
}