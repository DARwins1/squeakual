include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	// Go DIRECTLY to P1
	camSetStandardWinLossConditions(CAM_VICTORY_TIMEOUT, "P1", {reinforcements: -1});
	// Do NOT pass "GO"
	queue("camScriptedVictory", camSecondsToMilliseconds(0.5));
	// Do NOT collect 200 Power
}
