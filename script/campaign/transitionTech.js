//Contains the campaign transition technology definitions.

// Basic base structures
const camBasicStructs = [
	"A0CommandCentre", "A0PowerGenerator", "A0ResourceExtractor",
	"A0ResearchFacility", "A0LightFactory", "A0CyborgFactory",
];

// Contains research granted at the very start
const camRec1StartResearch = [
	"R-Wpn-MG1Mk1", "R-Vehicle-Body01", "R-Sys-Spade1Mk1", "R-Vehicle-Prop-Wheels",
	"R-Comp-SynapticLink", "R-Cyborg-Wpn-MG", "R-Cyb-Sys-Construct",
];

// Contains everything that the player starts with in the Prologue to Reclamation
// Basically just everything the player acquires before L4.
const camRec2StartResearch = [
	// L1
	"R-Wpn-MG-Damage01", "R-Sys-Sensor-Turret01", "R-Sys-Sensor-Tower01",
	"R-Wpn-Rocket05-MiniPod", "R-Defense-Tower06", "R-Wpn-Rocket-Damage01",
	"R-Sys-Engineering01", "R-Sys-MobileRepairTurret01", "R-Cyb-Sys-Repair",
	"R-Vehicle-Prop-Tracks", "R-Defense-TankTrap01",

	// L2
	"R-Wpn-Mortar01Lt", "R-Wpn-Mortar-Damage01", "R-Cyb-Wpn-Grenade",
	"R-Wpn-MG2Mk1", "R-Wpn-MG-Damage02",

	// L3
	"R-Wpn-Cannon1Mk1", "R-Defense-Cannon", "R-Defense-Cannon",
	"R-Cyborg-Wpn-Cannon", "R-Wpn-Cannon-Damage01", "R-Cyborg-Metals01",
	"R-Vehicle-Metals01", "R-Wpn-Flamer01Mk1", "R-Defense-Flamer",
	"R-Cyborg-Wpn-Flamer", "R-Wpn-Flamer-Damage01",
].concat(camRec1StartResearch);

// What is acquired during the Prologue
const camRec2PrologueResearch = [
	//PL2
	"R-Wpn-Rocket-LtA-TMk1", "R-Defense-Sarissa",
];

// Used to grant research at the start of Act 1
const camAct1StartResearch = camRec2StartResearch.concat(camRec2PrologueResearch);

// Used to grant research to allies on A1L2
const camA1L2AllyResearch = camAct1StartResearch.concat([
	// A1L1
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Rocket02-MRL", "R-Defense-MRL", 
]);

// Used to grant research to allies on A1L4
const camA1L4AllyResearch = camA1L2AllyResearch.concat([
	// A1L2
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Cannon-ROF01", "R-Wpn-Cannon-Damage02",
	"R-Wpn-Rocket-Accuracy01", "R-Wpn-Rocket-ROF01", "R-Wpn-Rocket-Damage02",
	"R-Struc-PowerModuleMk1", "R-Vehicle-Prop-VTOL", "R-Struc-VTOLFactory",
	"R-Struc-VTOLPad", "R-Sys-VTOLStrike-Turret01", "R-Sys-VTOLStrike-Tower01",
	"R-Wpn-MG3Mk1", "R-Wpn-MG-Damage03", "R-Cyborg-Wpn-HvyMG",
	// A1L3
	"R-Vehicle-Prop-Halftracks", 
	"R-Defense-Tower01", "R-Wpn-Flamer-Damage03",
	"R-Wpn-Mortar-Damage02", "R-Wpn-MG-ROF01",
]);

const camAct2StartResearch = [
	// A1L5
	"R-Vehicle-Body02", "R-Vehicle-Metals02", "R-Cyborg-Metals02",
	"R-Wpn-AAGun03", "R-Defense-AASite-QuadMg1", "R-Struc-CommandRelay",
	"R-Comp-CommandTurret01", "R-Wpn-Rocket01-LtAT", "R-Cyborg-Wpn-Rocket",
	"R-Defense-Pillbox06", "R-Defense-LancerTower", "R-Defense-WallTower06",
	"R-Defense-HardcreteWall", "R-Defense-HardcreteGate", "R-Defense-MortarPit",
	"R-Defense-Pillbox01", "R-Defense-Pillbox04", "R-Defense-Pillbox05", 
	"R-Defense-WallTower01", "R-Defense-WallTower02", "R-Defense-WallUpgrade01",
	"R-Defense-WallUpgrade02", "R-Struc-Materials01", "R-Struc-Materials02",
].concat(camA1L4AllyResearch);

// Used to grant research to team Delta on A2L2
const camA2L2AllyResearch = camAct2StartResearch.concat([
	// A2L1
	"R-Defense-WallUpgrade03", "R-Struc-Materials03", "R-Wpn-AAGun-Damage01",
	"R-Struc-Factory-Module", "R-Struc-RepairFacility", "R-Vehicle-Body05",
	"R-Wpn-Cannon2Mk1", "R-Defense-WallTower03", "R-Wpn-Cannon-Damage03",
]);

//...
