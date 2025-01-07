include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(46, 11, 34, 2);
	centreView(46, 11);
	setNoGoArea(45, 10, 47, 12, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A1L4");

	// In case the player didn't get this in the last mission
	enableResearch("R-Wpn-MG-ROF01", CAM_HUMAN_PLAYER);

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Descrease the lighting slightly
	camSetSunIntensity(.45,.45,.45);
	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	camSetWeather(CAM_WEATHER_RAINSTORM);

	// Place the satellite uplink from A1L3
	const NASDA = 1;
	setAlliance(CAM_HUMAN_PLAYER, NASDA, true);
	addStructure("UplinkCentre", NASDA, 108 * 128, 50 * 128);

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "CLAYDE: Lieutenant, tell me everything we know about who team Bravo just fought.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Well, it appears that they are the source of those transmissions I mentioned earlier.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We still haven't fully decrypted the transmissions we've intercepted.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: From what we have decoded, they refer to themselves as \"The Collective\".", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We don't know about their numbers, capabilities, or motives.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But from Bravo's brief skirmish, they appear to be well-equipped.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Alright, we should be on alert, then.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: What of the uplink secured by team Bravo?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It appears to be at least partially functional, sir.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We should be able to establish a connection between NASDA central and the orbiting satellites within a matter of days.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Excellent, soon we'll be able to-.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: General? General!?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Come in General! What's going on over there?!", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: ...-under attack! Repeat, NASDA Central is under attack by scavenger forces!", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Priority one objective; Commanders Bravo, Foxtrot, Delta, move to defend NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We cannot lose this site!", delay: 3, sound: CAM_RCLICK},
	]);
}