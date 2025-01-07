include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(101, 116, 123, 94);
	centreView(101, 116);
	setNoGoArea(100, 115, 102, 117, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A2L6");

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set the fog to it's default colours
	// camSetFog(182, 225, 236);

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "LIEUTENANT: Sir, Commander Bravo has cleared the Collective's northern positions.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Good.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: And what of the Collective's counter attack?", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Well, this should disrupt their movements for some time.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But I doubt this will delay them forever.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We'll have to make do, then. This is the best chance we'll get.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commanders Bravo, Charlie, Golf.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: It's time to assault the Collective's main prisoner camp.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: I'll let the Lieutenant brief you all on the plan.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Yes, sir.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We've already found suitable LZs for your forces to the west of the compound.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Each of you will send a strike team to these positions.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Once you land, you'll need to act quickly and clear any nearby enemies, before they can alert the Collective to our arrival.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Once your LZs are secure, call for reinforcements and wait for the General's signal.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Correct.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Once all teams are in place, I'll personally command some forces to initiate a diversion.", delay: 1, sound: CAM_RCLICK},
		{text: "CLAYDE: When that happens, I'll have to maintain radio silence.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: The Lieutenant will take charge of operations from there.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Now, let's move. We don't have any time to dawdle.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Good luck, Commanders.", delay: 3, sound: CAM_RCLICK},
		// Separate from the mission briefing
		{text: "LIEUTENANT: Bravo, remember that you'll need to clear the LZ before you can call in any reinforcements.", delay: 12, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We can't risk the Collective detecting us before Clayde has launched his diversion.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Make sure you bring enough combat units in your first transport.", delay: 3, sound: CAM_RCLICK},
	]);

	// Lighten the fog to *more or less* 2x default brightness
	camSetFog(32, 32, 96);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Increase the lighting
	camSetSunIntensity(.6,.6,.6);
	camSetWeather(CAM_WEATHER_CLEAR);
}