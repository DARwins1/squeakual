include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(101, 116, 85, 94);
	centreView(101, 116);
	setNoGoArea(100, 115, 102, 117, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A2L4");

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	// queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set the fog to it's default colours
	// camSetFog(182, 225, 236);

	// Placeholder for the actual briefing sequence
	camQueueDialogue([
		{text: "---- BRIEFING PLACEHOLDER ----", delay: 0},
		{text: "CHARLIE: General, by tracing the routes of Collective transports and with the data at the previous base, we were able to locate the Collective's main prisoner camp.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Excellent. Have team Delta perform reconnaissance in the area.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: We should know what we're up against before we even consider making any moves towards it.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Lieutenant, when can we expect the Collective to amass another large-scale attack against one of our teams?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...It's hard to say, sir. We're tracking plenty of enemy movement all over the city.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But so far their movements seem disorganized and sporadic, likely a symptom of a poor command structure or logistics system.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: If we're lucky, it should take them time before they can organize another assault.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I see.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: For now, we'll have to work with the time we have.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, during your last mission, we regained contact with team Golf.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: They've managed to hold off the Collective so far, but they're running low on resources, and need reinforcements.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: However, the Collective have surrounded their position with anti-aircraft sites, and we can't get any transports through safely.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Your objective is to punch a hole in the Collective's blockade.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Take your forces and land outside the range of these AA sites, then neutralize them with a ground assault.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Once enough of these sites are gone, we'll be able to send reinforcements to team Golf.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Good luck, Commander.", delay: 3, sound: CAM_RCLICK},
		// Separate from the mission briefing
		{text: "LIEUTENANT: Commander Bravo, those AA sites are located in the flooded portion of the city.", delay: 12, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It'll be challenging to navigate the terrain there with conventional ground forces.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...But the propulsion that you found the in the that last Collective base may prove to be useful there.", delay: 3, sound: CAM_RCLICK},
	]);

	camSetSunIntensity(.35, .35, .45);
}