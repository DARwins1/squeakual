//;; # `libcampaign.js` documentation
//;;
//;; `libcampaign.js` is a JavaScript library supplied with the game,
//;; which contains reusable code for campaign scenarios. It is designed to
//;; make scenario development as high-level and declarative as possible.
//;; It also contains a few simple convenient wrappers.
//;; Public API functions of `libcampaign.js` are prefixed with `cam`.
//;; To use `libcampaign.js`, add the following include into your scenario code:
//;;
//;; ```js
//;; include("script/campaign/libcampaign.js");
//;; ```
//;;
//;; Also, most of the `libcampaign.js` features require some of the game
//;; events handled by the library. Transparent JavaScript pre-hooks are
//;; therefore injected into your global event handlers upon include.
//;; For example, if `camSetArtifacts()` was called to let `libcampaign.js`
//;; manage scenario artifacts, then `eventPickup()` will be first handled
//;; by the library, and only then your handler will be called, if any.
//;; All of this happens automagically and does not normally require
//;; your attention.
//;;

/*
	Private vars and functions are prefixed with `__cam`.
	Private consts are prefixed with `__CAM_` or `__cam_`.
	Public vars/functions are prefixed with `cam`, consts with `CAM_` or `cam_`.
	Please do not use private stuff in scenario code, use only public API.

	It is encouraged to prefix any local consts with `__` in any function in the
	library if they are not objects/arrays. Mission scripts may use a `_` but
	only if the name seems like it could clash with a JS API global.

	Please CAPITALIZE const names for consistency for most of everything.
	The only exception to these rules is when the const is declared in a loop
	initialization or will be assigned as a global-context callback function,
	or if it will be a JS object/array as these aren't truly immutable. Follow
	standard camel case style as usual.

	Also, in the event you want a top level const for a mission script
	(and any include file) please prefix it with `MIS_` or `mis_` depending on
	if it's an object/array or not.

	We CANNOT put our private vars into an anonymous namespace, even though
	it's a common JS trick -

		(function(global) {
			var __camPrivateVar; // something like that
		})(this);

	because they would break on savegame-loadgame. So let's just agree
	that we'd never use them anywhere outside the file, so that it'd be easier
	to change them, and also think twice before we change the public API.

	The lib is split into sections, each section is separated with a slash line:

////////////////////////////////////////////////////////////////////////////////
// Section name.
////////////////////////////////////////////////////////////////////////////////

	yeah, like that. Also, it's exactly 80 characters wide.

	In each section, public stuff is on TOP, and private stuff
	is below, split from the public stuff with:

//////////// privates

	, for easier reading (all the useful stuff on top).

	Please leave camDebug() around if something that should never happen
	occurs, indicating an actual bug in campaign. Then a sensible message
	should be helpful as well. But normally, no warnings should ever be
	printed.

	In cheat mode, more warnings make sense, explaining what's going on
	under the hood. Use camTrace() for such warnings - they'd auto-hide
	outside cheat mode.

	Lines prefixed with // followed by ;; are docstrings for JavaScript API
	documentation.
*/

////////////////////////////////////////////////////////////////////////////////
// Library initialization.
////////////////////////////////////////////////////////////////////////////////

// Registers a private event namespace for this library, to avoid collisions with
// any event handling in code using this library. Make sure no other library uses
// the same namespace, or strange things will happen. After this, we can name our
// event handlers with the registered prefix, and they will still get called.
namespace("cam_");

//////////global vars start
//These are campaign player numbers.
const CAM_HUMAN_PLAYER = 0;
const CAM_NEW_PARADIGM = 1;
const CAM_THE_COLLECTIVE = 2;
const CAM_NEXUS = 3;
const CAM_INFESTED = 4;
// const CAM_TEAM_CHARLIE = 5;
const CAM_SCAV_6 = 6;
const CAM_SCAV_7 = 7;

const __CAM_MAX_PLAYERS = 10;
const __CAM_TICKS_PER_FRAME = 100;
const __CAM_AI_POWER = 999999;
const __CAM_INCLUDE_PATH = "script/campaign/libcampaign_includes/";

//level load codes here for reference. Might be useful for later code.
const CAM_GAMMA_OUT = "GAMMA_OUT"; //Fake next level for the final Gamma mission.
const __CAM_ALPHA_CAMPAIGN_NUMBER = 1;
const __CAM_BETA_CAMPAIGN_NUMBER = 2;
const __CAM_GAMMA_CAMPAIGN_NUMBER = 3;
const __CAM_UNKNOWN_CAMPAIGN_NUMBER = 1000;
const __cam_alphaLevels = [
	"CAM_1A", "CAM_1B", "SUB_1_1S", "SUB_1_1", "SUB_1_2S", "SUB_1_2", "SUB_1_3S",
	"SUB_1_3", "CAM_1C", "CAM_1CA", "SUB_1_4AS", "SUB_1_4A", "SUB_1_5S", "SUB_1_5",
	"CAM_1A-C", "SUB_1_7S", "SUB_1_7", "SUB_1_DS", "SUB_1_D", "CAM_1END"
]; // 12 missions
const __cam_betaLevels = [
	"CAM_2A", "SUB_2_1S", "SUB_2_1", "CAM_2B", "SUB_2_2S", "SUB_2_2", "CAM_2C",
	"SUB_2_5S", "SUB_2_5", "SUB_2DS", "SUB_2D", "SUB_2_6S", "SUB_2_6", "SUB_2_7S",
	"SUB_2_7", "SUB_2_8S", "SUB_2_8", "CAM_2END"
]; // 11 missions
const __cam_gammaLevels = [
	"CAM_3A", "SUB_3_1S", "SUB_3_1", "CAM_3B", "SUB_3_2S", "SUB_3_2", "CAM3A-B",
	"CAM3C", "CAM3A-D1", "CAM3A-D2", "CAM_3_4S", "CAM_3_4"
]; // 9 missions
// total missions: 32
const __CAM_RECLAMATION_CAMPAIGN_NUMBER = 0;
const __CAM_PROLOGUE_CAMPAIGN_NUMBER = 1;
const __CAM_ACT1_CAMPAIGN_NUMBER = 2;
const __CAM_ACT2_CAMPAIGN_NUMBER = 3;
const __CAM_ACT3_CAMPAIGN_NUMBER = 4;
const __CAM_ACT4A_CAMPAIGN_NUMBER = 5;
const __CAM_ACT4B_CAMPAIGN_NUMBER = 6;
const __cam_reclamationLevels = [
	"L1", // RECLAMATION
	"L2S", "L2", // LIBERATOR
	"L3", // STOMP OUT
	"L4S", "L4", // BREACH
	"L5S", "L5", // CLEANUP
	"L6S", "L6", // FRIENDLY SKIES
	"L7", // EVACUATION
]; // 7 missions
const __cam_prologueLevels = [
	"PL1", // PUTRID
	"PL2", // SAFE HAVEN
]; // 2 missions
const __cam_act1Levels = [
	"A1L1", // WELCOME TO THE JUNGLE
	"A1L2S", "A1L2", // ALLIED ASSAULT
	"A1L3", // RISING
	"A1L4S", "A1L4", // THE COLLECTIVE
	"A1L5S", "A1L5", // A FRIEND IN NEED
	"A1L6", // ONSLAUGHT
]; // 6 missions
const __cam_act2Levels = [
	"A2L1", // HOT DROP
	"A2L2S", "A2L2", // DISILLUSIONED
	"A2L3", // A LIGHT
	"A2L4S", "A2L4", // IRON DOME
	"A2L5", // CHOKEHOLD
	"A2L6S", "A2L6", // BREAKOUT
	"A2L7", // ONSLAUGHT
]; // 7 missions
const __cam_act3Levels = [
	"A3L1", // OUTBREAK
	"A3L2S", "A3L2", // SEARCH AND UNRESCUE
	"A3L3S", "A3L3", // SHELL SHOCKED
	"A3L4S", "A3L4", // POST-POCALYPSE PIRACY
	"A3L5", // ONSLAUGHT
];
const __cam_act4RouteALevels = [
	"A4L1A", // DEAD CENTER
	"A4L2AS", "A4L2A", // UPLINK
	"A4L3A", // HUNTED
	"A4L4AS", "A4L4A", // SHOWDOWN
	"A4L5AS", "A4L5A", // EXODUS
];
const __cam_act4RouteBLevels = [
	"A4L1BS", "A4L1B", // ARMS RACE
	"A4L2BS", "A4L2B", // TIGER'S DEN
	"A4L3BS", "A4L3B", // APPREHENSION
	"A4L4BS", "A4L4B", // PREMONITION
	"A4L5BS", "A4L5B", // MIGHT OF THE MACHINE
	"A4L6BS", "A4L6B", // ASUNDER
	"A4L7BS", // FINAL STAND
];

// Holds all the sounds the campaign uses. Try to name things as they are said.
const cam_sounds = {
	baseDetection: {
		scavengerOutpostDetected: "pcv375.ogg",
		scavengerBaseDetected: "pcv374.ogg",
		enemyBaseDetected: "pcv379.ogg",
		enemyLZDetected: "pcv382.ogg",
	},
	baseElimination: {
		scavengerOutpostEradicated: "pcv391.ogg",
		scavengerBaseEradicated: "pcv392.ogg",
		enemyBaseEradicated: "pcv394.ogg",
	},
	lz: {
		returnToLZ: "pcv427.ogg",
		LZCompromised: "pcv445.ogg",
		LZClear: "lz-clear.ogg",
	},
	transport: {
		transportUnderAttack: "pcv443.ogg",
		enemyTransportDetected: "pcv381.ogg",
		incomingEnemyTransport: "pcv395.ogg",
	},
	incoming: {
		incomingIntelligenceReport: "pcv456.ogg",
		incomingTransmission: "pcv455.ogg",
	},
	rescue: {
		unitsRescued: "pcv615.ogg",
		groupRescued: "pcv616.ogg",
		civilianRescued: "pcv612.ogg",
	},
	nexus: {
		defensesAbsorbed: "defabsrd.ogg",
		defensesNeutralized: "defnut.ogg",
		laugh1: "laugh1.ogg",
		laugh2: "laugh2.ogg",
		laugh3: "laugh3.ogg",
		productionCompleted: "pordcomp.ogg",
		researchAbsorbed: "resabsrd.ogg",
		structureAbsorbed: "strutabs.ogg",
		structureNeutralized: "strutnut.ogg",
		synapticLinksActivated: "synplnk.ogg",
		unitAbsorbed: "untabsrd.ogg",
		unitNeutralized: "untnut.ogg",
	},
	missile: {
		launch: {
			missileLaunchAborted: "labort.ogg",
			missileLaunched: "mlaunch.ogg",
			finalMissileLaunchSequenceInitiated: "flseq.ogg",
			missileEnteringFinalLaunchPeriod: "meflp.ogg",
			missileLaunchIn60Minutes: "60min.ogg",
			missileLaunchIn50Minutes: "50min.ogg",
			missileLaunchIn40Minutes: "40min.ogg",
			missileLaunchIn30Minutes: "30min.ogg",
			missileLaunchIn20Minutes: "20min.ogg",
			missileLaunchIn10Minutes: "10min.ogg",
			missileLaunchIn5Minutes: "5min.ogg",
			missileLaunchIn4Minutes: "4min.ogg",
			missileLaunchIn3Minutes: "3min.ogg",
			missileLaunchIn2Minutes: "2min.ogg",
			missileLaunchIn1Minute: "1min.ogg",
		},
		detonate: {
			warheadActivatedCountdownBegins: "wactivat.ogg",
			finalDetonationSequenceInitiated: "fdetseq.ogg",
			detonationIn60Minutes: "det60min.ogg",
			detonationIn50Minutes: "det50min.ogg",
			detonationIn40Minutes: "det40min.ogg",
			detonationIn30Minutes: "det30min.ogg",
			detonationIn20Minutes: "det20min.ogg",
			detonationIn10Minutes: "det10min.ogg",
			detonationIn5Minutes: "det5min.ogg",
			detonationIn4Minutes: "det4min.ogg",
			detonationIn3Minutes: "det3min.ogg",
			detonationIn2Minutes: "det2min.ogg",
			detonationIn1Minute: "det1min.ogg",
		},
		countdown: "10to1.ogg",
	},
	radio: {
		click1: "radclik1.ogg",
		click2: "radclik2.ogg",
		click3: "radclik3.ogg",
		click4: "radclik4.ogg",
		click5: "radclik5.ogg",
		click6: "radclik6.ogg",
	},
	reinforcementsAreAvailable: "pcv440.ogg",
	objectiveCaptured: "pcv621.ogg",
	enemyEscaping: "pcv632.ogg",
	powerTransferred: "power-transferred.ogg",
	laserSatelliteFiring: "pcv650.ogg",
	artifactRecovered: "pcv352.ogg",
	soundIdentifier: ".ogg", //Used by video.js to check for sound before a video.
};

//artifact
var __camArtifacts;
var __camNumArtifacts;

//base
var __camEnemyBases;
var __camNumEnemyBases;

//dialogue
const CAM_RCLICK = "RADIO_CLICK";
var __camQueuedDialogue;
var __camLatestDialogueTime;

//reinforcements
const CAM_REINFORCE_NONE = 0;
const CAM_REINFORCE_GROUND = 1;
const CAM_REINFORCE_TRANSPORT = 2;

//debug
var __camMarkedTiles = {};
var __camCheatMode = false;
var __camDebuggedOnce = {};
var __camTracedOnce = {};

//events
var __camSaveLoading;

//keep track of the colour of fog
//these values are given values every level
//this is hacky and stoopid
var __camFogR;
var __camFogG;
var __camFogB;

//group
var __camNewGroupCounter;
var __camNeverGroupDroids;
var __camRefillableGroupInfo;

//hook
var __camOriginalEvents = {};

//misc
const __camPowerLimits = [ // Power limits
	999999, // SUPEREASY
	100000, // EASY
	50000, // MEDIUM
	20000, // HARD
	10000, // INSANE
];
const __camTimerlessPowerLimits = [ // Timerless mode power limits 
	// Note that these are MUCH lower
	50000, // SUPEREASY
	20000, // EASY
	10000, // MEDIUM
	5000, // HARD
	2000, // INSANE
];
var __camCalledOnce = {};
var __camExpLevel;
var __camLabelInfo;

//nexus
var __camLastNexusAttack;
var __camNexusActivated;

//production
var __camFactoryInfo;
var __camFactoryQueue;
var __camPropulsionTypeLimit;
const __CAM_ASSEMBLY_DEFENSE_RADIUS = 8;

//tactics
const CAM_ORDER_ATTACK = 0;
const CAM_ORDER_DEFEND = 1;
const CAM_ORDER_PATROL = 2;
const CAM_ORDER_COMPROMISE = 3;
const CAM_ORDER_FOLLOW = 4;
var __camGroupInfo;
const __CAM_TARGET_TRACKING_RADIUS = 7;
const __CAM_PLAYER_BASE_RADIUS = 20;
const __CAM_DEFENSE_RADIUS = 4;
const __CAM_CLOSE_RADIUS = 2;
const __CAM_CLUSTER_SIZE = 8;
const __CAM_FALLBACK_TIME_ON_REGROUP = 5000;
var __camGroupAvgCoord = {x: 0, y: 0};
const DORDER_DROIDREPAIR = 26; // Until I figure out where the other orders are defined, I'll put these here
const DORDER_RTR_SPECIFIED = 35;

//time
const CAM_MILLISECONDS_IN_SECOND = 1000;
const CAM_SECONDS_IN_MINUTE = 60;
const CAM_MINUTES_IN_HOUR = 60;

//transport
var __camNumTransporterExits;
var __camPlayerTransports;
var __camIncomingTransports;
var __camTransporterQueue;
var __camTransporterMessage;

//truck
var __camTruckInfo;
var __camTruckAssignList;

//victory
const CAM_VICTORY_STANDARD = "__camVictoryStandard";
const CAM_VICTORY_PRE_OFFWORLD = "__camVictoryPreOffworld";
const CAM_VICTORY_OFFWORLD = "__camVictoryOffworld";
const CAM_VICTORY_TIMEOUT = "__camVictoryTimeout";
const CAM_VICTORY_SCRIPTED = "__camVictoryScripted"; // Added by Reclamation
var __camWinLossCallback;
var __camNextLevel;
var __camNeedBonusTime;
var __camDefeatOnTimeout;
var __camVictoryData;
var __camRTLZTicker;
var __camLZCompromisedTicker;
var __camLastAttackTriggered;
var __camLevelEnded;
var __camExtraObjectiveMessage;
var __camAllowVictoryMsgClear;

//video
var __camVideoSequences;

//vtol
var __camVtolDataSystem;
//////////globals vars end

// A hack to make sure we do not put this variable into the savegame. It is
// called from top level, because we need to call it again every time we load
// scripts. But other than this one, you should in general never call game
// functions from toplevel, since all game state may not be fully initialized
// yet at the time scripts are loaded. (Yes, function name needs to be quoted.)
hackDoNotSave("__camOriginalEvents");

include(__CAM_INCLUDE_PATH + "misc.js");
include(__CAM_INCLUDE_PATH + "debug.js");
include(__CAM_INCLUDE_PATH + "hook.js");
include(__CAM_INCLUDE_PATH + "events.js");

include(__CAM_INCLUDE_PATH + "time.js");
include(__CAM_INCLUDE_PATH + "research.js");
include(__CAM_INCLUDE_PATH + "artifact.js");
include(__CAM_INCLUDE_PATH + "base.js");
include(__CAM_INCLUDE_PATH + "reinforcements.js");
include(__CAM_INCLUDE_PATH + "tactics.js");
include(__CAM_INCLUDE_PATH + "production.js");
include(__CAM_INCLUDE_PATH + "truck.js");
include(__CAM_INCLUDE_PATH + "victory.js");
include(__CAM_INCLUDE_PATH + "transport.js");
include(__CAM_INCLUDE_PATH + "vtol.js");
include(__CAM_INCLUDE_PATH + "nexus.js");
include(__CAM_INCLUDE_PATH + "group.js");
include(__CAM_INCLUDE_PATH + "video.js");
include(__CAM_INCLUDE_PATH + "dialogue.js");
include(__CAM_INCLUDE_PATH + "guide.js");
