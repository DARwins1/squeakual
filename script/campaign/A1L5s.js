include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(46, 11, 68, 2);
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
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A1L5");

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting and add a slight blue hue
	camSetSunIntensity(.4, .4, .5);
	camSetWeather(CAM_WEATHER_RAINSTORM);
	camSetSkyType(CAM_SKY_NIGHT);

	// Place the satellite uplink from A1L3
	const NASDA = 1;
	setAlliance(CAM_HUMAN_PLAYER, NASDA, true);
	addStructure("UplinkCentre", NASDA, 108 * 128, 50 * 128);

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "LIEUTENANT: Commander Bravo? Commander Bravo come in!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Oh thank goodness, I still have your signal!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Everything is falling apart.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I've lost contact with everyone except you and Commander Charlie.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The Collective completely overran NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But thanks to you, they shouldn't be able to use NASDA's satellite control systems.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We lost contact with Commander Foxtrot and his team, and we believe that they were captured by the Collective.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Team Delta was able to evacuate, but we lost contact with them shortly after they returned to base.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: As for the General...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: His transport was shot down en route to a safe haven.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The transport crashed near what appears to be a Collective base.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We'll have to move quickly, Commander.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: If the General or any of his men survived the crash, it's likely that they're being held there.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We cannot allow the Collective to move them to a more secure location.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: You'll need to take your forces to the General's crash site, then locate and rescue and rescue any survivors.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Please make haste, Commander.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: If the Collective capture Clayde, I don't know what we'll do.", delay: 2, sound: CAM_RCLICK},
	]);
}