include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(101, 116, 118, 118);
	centreView(101, 116);
	setNoGoArea(100, 115, 102, 117, CAM_HUMAN_PLAYER); // TODO: These coordinates will need to be updated once the full hub map is complete
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
	// camQueueDialogue([
	// 	{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
	// 	{text: "LIEUTENANT: Sir, all teams are settled in and awaiting orders.", delay: camSecondsToMilliseconds(2), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: Excellent.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: Lieutenant, have you scouted NASDA Central? What are we up against?", delay: camSecondsToMilliseconds(2), sound: CAM_RADIO_CLICK},
	// 	{text: "LIEUTENANT: Yes sir. We've done some limited aerial reconnaissance using our transporters.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "LIEUTENANT: But to avoid alerting any inhabitants, I have avoided sending our transports too close.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "LIEUTENANT: Our observations are limited, but we've detected a large scavenger presence around NASDA Central.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "LIEUTENANT: It seems one of the local factions has been using it as their base of operations.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: I see.", delay: camSecondsToMilliseconds(4), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: Still, I'm sure it's nothing that we can't handle.", delay: camSecondsToMilliseconds(2), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: Commander Bravo, seeing as you have the most combat experience, you will serve as a pathfinder.", delay: camSecondsToMilliseconds(4), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: You will transport your forces to the outskirts of NASDA Central.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: From there, you will clear landing zones for teams Charlie, Foxtrot, and Golf.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: Then together, clear the area of hostiles and capture NASDA Central.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "CLAYDE: With any luck, NASDA Central will be ours by the end of the day.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// 	{text: "LIEUTENANT: Good luck, Commander.", delay: camSecondsToMilliseconds(3), sound: CAM_RADIO_CLICK},
	// ]);
}