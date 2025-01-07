include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(46, 11, 34, 2);
	centreView(46, 11);
	setNoGoArea(45, 10, 47, 12, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A1L2");

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Lighten the fog to *more or less* 2x default brightness
	camSetFog(32, 32, 96);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Increase the lighting
	camSetSunIntensity(.6,.6,.6);

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "LIEUTENANT: Sir, all teams are settled in and awaiting orders.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Excellent.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Lieutenant, have you scouted NASDA Central? What are we up against?", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Yes sir. We've done some limited aerial reconnaissance using our transporters.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But to avoid alerting any inhabitants, I have avoided sending our transports too close.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Our observations are limited, but we've detected a large scavenger presence around NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It seems one of the local factions has been using it as their base of operations.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I see.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Still, I'm sure it's nothing that we can't handle.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, seeing as you have the most combat experience, you will serve as a pathfinder.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: You will transport your forces to the outskirts of NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: From there, you will clear landing zones for teams Charlie, Foxtrot, and Golf.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Then together, clear the area of hostiles and capture NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: With any luck, NASDA Central will be ours by the end of the day.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Good luck, Commander.", delay: 3, sound: CAM_RCLICK},
	]);
}