// Contains structure sets used by trucks for building/maintaining bases.
// The sets here are usually bases that aren't present on the map at the start of the level,
// but are built later on by trucks.

// A1L2
// Charlie LZ
const camCharlieA1L2Structs = [
	{stat: "Cannon-Emplacement", x: 25, y: 70}, {stat: "A0TankTrap", x: 25, y: 71}, {stat: "A0TankTrap", x: 28, y: 69},
	{stat: "Flamer-Emplacement", x: 29, y: 69}, {stat: "A0TankTrap", x: 30, y: 69}, {stat: "GuardTower6", x: 28, y: 70},
	{stat: "Emplacement-MRL-pit", x: 26, y: 72}, {stat: "Emplacement-MRL-pit", x: 30, y: 71}, {stat: "Emplacement-MRL-pit", x: 32, y: 71},
];

// Foxtrot LZ
const camFoxtrotA1L2Structs = [
	{stat: "GuardTower6", x: 3, y: 58}, {stat: "Flamer-Emplacement", x: 6, y: 58}, {stat: "Sarissa-Tower", x: 7, y: 58},
	{stat: "Sarissa-Tower", x: 8, y: 57}, {stat: "GuardTower6", x: 6, y: 60}, {stat: "Flamer-Emplacement", x: 9, y: 59},
	{stat: "GuardTower6", x: 6, y: 64}, {stat: "A0TankTrap", x: 8, y: 62}, {stat: "A0TankTrap", x: 8, y: 63},
	{stat: "Flamer-Emplacement", x: 9, y: 63}, {stat: "Sarissa-Tower", x: 8, y: 65}, {stat: "Sarissa-Tower", x: 11, y: 65},
	{stat: "Emplacement-MRL-pit", x: 6, y: 66},
];

// Golf LZ
const camGolfA1L2Structs = [
	{stat: "Cannon-Emplacement", x: 59, y: 25}, {stat: "A0TankTrap", x: 60, y: 25}, {stat: "Cannon-Emplacement", x: 56, y: 26},
	{stat: "A0TankTrap", x: 56, y: 27}, {stat: "GuardTower6", x: 60, y: 26}, {stat: "GuardTower6", x: 57, y: 28},
	{stat: "GuardTower6", x: 57, y: 34}, {stat: "GuardTower6", x: 60, y: 34},
];

// A1L3
// Collective LZ ground defenses
const camA1L3LZStructs = [
	{stat: "A0TankTrap", x: 119, y: 28}, {stat: "A0TankTrap", x: 123, y: 28}, {stat: "A0TankTrap", x: 118, y: 29},
	{stat: "A0TankTrap", x: 124, y: 29}, {stat: "A0TankTrap", x: 118, y: 33}, {stat: "A0TankTrap", x: 124, y: 33},
	{stat: "A0TankTrap", x: 119, y: 34}, {stat: "A0TankTrap", x: 123, y: 34}, {stat: "Cannon-Emplacement", x: 121, y: 28},
	{stat: "Cannon-Emplacement", x: 118, y: 31}, {stat: "Cannon-Emplacement", x: 124, y: 31}, {stat: "Cannon-Emplacement", x: 121, y: 34},
	{stat: "GuardTower1", x: 119, y: 29}, {stat: "GuardTower1", x: 123, y: 29}, {stat: "GuardTower1", x: 119, y: 33},
	{stat: "GuardTower1", x: 123, y: 33}, {stat: "GuardTower6", x: 119, y: 18}, {stat: "GuardTower6", x: 114, y: 24},
	{stat: "GuardTower6", x: 114, y: 26}, {stat: "Sys-SensoTower01", x: 116, y: 20},
];
// Addtional AA defenses
const camA1L3AntiAir = [
	{stat: "AASite-QuadMg1", x: 121, y: 20, rot: 3}, {stat: "AASite-QuadMg1", x: 117, y: 27, rot: 3}, {stat: "AASite-QuadMg1", x: 116, y: 30, rot: 3},
	{stat: "AASite-QuadMg1", x: 116, y: 34, rot: 3},
];
// Uplink defenses
const camA1L3UplinkStructs = [
	{stat: "GuardTower1", x: 107, y: 46}, {stat: "GuardTower1", x: 106, y: 53}, {stat: "Cannon-Emplacement", x: 106, y: 48},
	{stat: "Cannon-Emplacement", x: 106, y: 51}, {stat: "GuardTower6", x: 109, y: 48}, {stat: "GuardTower6", x: 109, y: 51},
	{stat: "AASite-QuadMg1", x: 108, y: 53}, {stat: "Sys-SensoTower01", x: 111, y: 50}, {stat: "A0TankTrap", x: 107, y: 45}, 
	{stat: "A0TankTrap", x: 106, y: 46}, {stat: "A0TankTrap", x: 106, y: 49}, {stat: "A0TankTrap", x: 106, y: 50},
	{stat: "A0TankTrap", x: 105, y: 53}, {stat: "A0TankTrap", x: 106, y: 54},
];

// A1L3
// Collective LZ defenses
const camA1L4ColLZ1Structs = [
	{stat: "PillBox4", x: 58, y: 17}, {stat: "AASite-QuadMg1", x: 59, y: 20, rot: 3}, {stat: "GuardTower6H", x: 54, y: 16},
	{stat: "PillBox1", x: 53, y: 18}, {stat: "GuardTower6H", x: 54, y: 21}, 
];
const camA1L4ColLZ2Structs = [
	{stat: "AASite-QuadMg1", x: 48, y: 3}, {stat: "Sys-SensoTower02", x: 47, y: 6}, {stat: "PillBox5", x: 50, y: 7},
	{stat: "GuardTower3", x: 53, y: 5}, {stat: "PillBox4", x: 53, y: 6}, {stat: "Emplacement-MortarPit01", x: 54, y: 3},
	{stat: "Emplacement-MortarPit01", x: 56, y: 4},
];
const camA1L4ColLZ3Structs = [
	{stat: "GuardTower6H", x: 59, y: 50}, {stat: "AASite-QuadMg1", x: 59, y: 47, rot: 2}, {stat: "AASite-QuadMg1", x: 57, y: 52},
	{stat: "PillBox1", x: 54, y: 51}, {stat: "PillBox1", x: 53, y: 47}, {stat: "GuardTower5", x: 55, y: 51},
];

// A1L6
// Collective LZ defenses
const camA1L6ColLZ1Structs = [
	{stat: "PillBox1", x: 74, y: 8}, {stat: "AASite-QuadMg1", x: 76, y: 9, rot: 3}, {stat: "AASite-QuadMg1", x: 76, y: 12, rot: 3},
	{stat: "GuardTower6H", x: 70, y: 10}, {stat: "A0TankTrap", x: 69, y: 10}, {stat: "A0TankTrap", x: 70, y: 11},
	{stat: "GuardTower6H", x: 70, y: 14}, {stat: "A0TankTrap", x: 69, y: 14}, {stat: "A0TankTrap", x: 70, y: 15},
	{stat: "PillBox4", x: 73, y: 14}, {stat: "A0TankTrap", x: 74, y: 14}, {stat: "GuardTower5", x: 74, y: 13},
];
const camA1L6ColLZ2Structs = [
	{stat: "A0TankTrap", x: 85, y: 34}, {stat: "AASite-QuadMg1", x: 86, y: 34, rot: 3}, {stat: "A0TankTrap", x: 86, y: 35},
	{stat: "A0TankTrap", x: 88, y: 34}, {stat: "AASite-QuadMg1", x: 88, y: 35}, {stat: "A0TankTrap", x: 89, y: 35},
	{stat: "GuardTower3", x: 82, y: 35}, {stat: "Sys-SensoTower02", x: 81, y: 37}, {stat: "PillBox4", x: 81, y: 38, rot: 3},
	{stat: "Emplacement-MortarPit01", x: 88, y: 37}, {stat: "Emplacement-MortarPit01", x: 86, y: 38}, {stat: "Emplacement-MortarPit01", x: 88, y: 39},
	{stat: "GuardTower5", x: 82, y: 40}, {stat: "GuardTower6H", x: 86, y: 40},
];
const camA1L6ColLZ3Structs = [
	{stat: "PillBox6", x: 57, y: 53}, {stat: "GuardTower3", x: 60, y: 53}, {stat: "GuardTower3", x: 56, y: 56},
	{stat: "A0TankTrap", x: 62, y: 53}, {stat: "AASite-QuadMg1", x: 62, y: 54, rot: 3}, {stat: "A0TankTrap", x: 61, y: 54},
	{stat: "A0TankTrap", x: 61, y: 57}, {stat: "AASite-QuadMg1", x: 62, y: 57, rot: 3}, {stat: "A0TankTrap", x: 62, y: 58},
	{stat: "Emplacement-MRL-pit", x: 59, y: 57},
];
const camA1L6ColLZ4Structs = [
	{stat: "PillBox1", x: 8, y: 46}, {stat: "PillBox4", x: 11, y: 51}, {stat: "AASite-QuadMg1", x: 4, y: 49, rot: 1},
	{stat: "Emplacement-MortarPit01", x: 4, y: 51}, {stat: "Emplacement-MortarPit01", x: 6, y: 53}, {stat: "AASite-QuadMg1", x: 9, y: 52, rot: 2},
	{stat: "A0TankTrap", x: 5, y: 47}, {stat: "GuardTower6H", x: 5, y: 48}, {stat: "A0TankTrap", x: 6, y: 48},
	{stat: "A0TankTrap", x: 9, y: 48}, {stat: "Sys-SensoTower02", x: 9, y: 49}, {stat: "A0TankTrap", x: 10, y: 49},
];

// A2L7
// Collective LZ defenses
const camA2L7ColLZ1Structs = [
	{stat: "TankTrapC", x: 75, y: 29},
	{stat: "TankTrapC", x: 74, y: 30},
	{stat: "AASite-QuadBof", x: 75, y: 30, rot: 3},
	{stat: "TankTrapC", x: 75, y: 31},
	{stat: "TankTrapC", x: 77, y: 27},
	{stat: "TankTrapC", x: 78, y: 26},
	{stat: "AASite-QuadBof", x: 78, y: 27, rot: 2},
	{stat: "TankTrapC", x: 79, y: 27},
	{stat: "Sys-SensoTower02", x: 80, y: 29},
	{stat: "WallTower-HPVcannon", x: 80, y: 31},
	{stat: "GuardTower5", x: 76, y: 32},
	{stat: "PillBox1", x: 79, y: 32},
];
const camA2L7ColLZ2Structs = [
	{stat: "WallTower-HPVcannon", x: 42, y: 63},
	{stat: "AASite-QuadBof", x: 44, y: 61, rot: 2},
	{stat: "AASite-QuadBof", x: 46, y: 61, rot: 2},
	{stat: "WallTower-HvATrocket", x: 48, y: 63},
	{stat: "A0HardcreteMk1Wall", x: 42, y: 64, rot: 1},
	{stat: "WallTower-HPVcannon", x: 42, y: 65},
	{stat: "GuardTower6H", x: 43, y: 66},
	{stat: "Sys-SensoTower02", x: 47, y: 66},
	{stat: "PillBox1", x: 47, y: 67},
	{stat: "PillBox1", x: 48, y: 66},
];
const camA2L7ColLZ3Structs = [
	{stat: "Emplacement-MortarPit02", x: 24, y: 95},
	{stat: "AASite-QuadBof", x: 26, y: 94, rot: 2},
	{stat: "AASite-QuadBof", x: 21, y: 96},
	{stat: "Emplacement-MortarPit02", x: 21, y: 99},
	{stat: "Emplacement-MortarPit02", x: 23, y: 96},
	{stat: "Sys-CB-Tower01", x: 23, y: 98},
	{stat: "AASite-QuadBof", x: 21, y: 101},
	{stat: "Emplacement-MortarPit02", x: 23, y: 100},
	{stat: "Sys-SensoTower02", x: 25, y: 101},
	{stat: "AASite-QuadBof", x: 25, y: 102},
	{stat: "PillBoxHPC", x: 26, y: 101},
	{stat: "WallTower-HPVcannon", x: 28, y: 96},
	{stat: "Tower-Projector", x: 29, y: 98},
];
const camA2L7ColLZ4Structs = [
	{stat: "PillBox6", x: 91, y: 60},
	{stat: "AASite-QuadBof", x: 93, y: 57},
	{stat: "PillBox1", x: 92, y: 58},
	{stat: "AASite-QuadBof", x: 95, y: 56},
	{stat: "Sys-SensoTower02", x: 95, y: 58},
	{stat: "WallTower-HPVcannon", x: 93, y: 62},
	{stat: "AASite-QuadBof", x: 97, y: 57},
	{stat: "Emplacement-MRLHvy-pit", x: 97, y: 59},
	{stat: "Emplacement-MRLHvy-pit", x: 98, y: 58},
	{stat: "WallTower-HPVcannon", x: 97, y: 62},
	{stat: "Tower-Projector", x: 99, y: 61},
];

// A3L4
// Collective LZ defenses
const camA3L4ColLZ1Structs = [
	{stat: "PillBoxHPC", x: 102, y: 32}, {stat: "AASite-QuadBof", x: 104, y: 33, rot: 1}, {stat: "WallTower-HPVcannon", x: 105, y: 35},
	{stat: "WallTower-HPVcannon", x: 104, y: 38}, {stat: "Sys-SensoTower02", x: 103, y: 37}, {stat: "Emplacement-MortarPit02", x: 101, y: 37},
	{stat: "Emplacement-MortarPit02", x: 100, y: 36}, {stat: "AASite-QuadBof", x: 99, y: 38},
];
const camA3L4ColLZ2Structs = [
	{stat: "Pillbox-RotMG", x: 120, y: 7}, {stat: "AASite-QuadBof", x: 122, y: 6, rot: 2}, {stat: "Wall-VulcanCan", x: 124, y: 7},
	{stat: "Wall-VulcanCan", x: 120, y: 11}, {stat: "AASite-QuadBof", x: 123, y: 11}, {stat: "Pillbox-RotMG", x: 125, y: 10},
	{stat: "A0TankTrap", x: 123, y: 12}, {stat: "A0TankTrap", x: 124, y: 11},
];
const camA3L4ColLZ3Structs = [
	{stat: "WallTower04", x: 106, y: 57}, {stat: "Wall-VulcanCan", x: 110, y: 58}, {stat: "AASite-QuadBof", x: 104, y: 58, rot: 3},
	{stat: "AASite-QuadBof", x: 104, y: 60, rot: 3}, {stat: "Emplacement-MRLHvy-pit", x: 106, y: 60}, {stat: "Emplacement-MRLHvy-pit", x: 107, y: 61},
	{stat: "Wall-VulcanCan", x: 109, y: 61},
];
const camA3L4ColLZ4Structs = [
	{stat: "WallTower-HvATrocket", x: 132, y: 49}, {stat: "AASite-QuadBof", x: 134, y: 48}, {stat: "Wall-VulcanCan", x: 136, y: 49},
	{stat: "PillBoxHPC", x: 132, y: 52}, {stat: "Wall-VulcanCan", x: 135, y: 53}, {stat: "Pillbox-RotMG", x: 137, y: 51},
	{stat: "AASite-QuadBof", x: 132, y: 54, rot: 2},
];

// A3L9
// Foxtrot & Golf structures
const camA3L9FoxtrotDefenseStructs = [
	{stat: "Emplacement-Ballista", x: 91, y: 109}, {stat: "WallTower-HvATrocket", x: 92, y: 106}, {stat: "A0HardcreteMk1Wall", x: 93, y: 106},
	{stat: "Sys-SensoTower02", x: 93, y: 107}, {stat: "Tower-Projector", x: 95, y: 105, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 94, y: 106},
	{stat: "Wall-RotMg", x: 95, y: 106}, {stat: "Emplacement-Ballista", x: 93, y: 110}, {stat: "Emplacement-Ballista", x: 95, y: 109},
	{stat: "AASite-QuadBof", x: 86, y: 124, rot: 2}, {stat: "AASite-QuadBof", x: 89, y: 124, rot: 2},
	{stat: "AASite-QuadBof", x: 92, y: 124, rot: 2}, {stat: "AASite-QuadBof", x: 95, y: 124, rot: 2},
	{stat: "WallTower-HvATrocket", x: 101, y: 103}, {stat: "A0HardcreteMk1Wall", x: 102, y: 103}, {stat: "A0HardcreteMk1Wall", x: 103, y: 103},
	{stat: "Tower-Projector", x: 99, y: 104, rot: 3}, {stat: "Emplacement-MRLHvy-pit", x: 101, y: 105}, {stat: "Emplacement-MRLHvy-pit", x: 103, y: 105},
	{stat: "WallTower-HvATrocket", x: 104, y: 103}, {stat: "Emplacement-MRLHvy-pit", x: 105, y: 105}, {stat: "Pillbox-RotMG", x: 107, y: 104},
	{stat: "AASite-QuadBof", x: 98, y: 124, rot: 2}, {stat: "Emplacement-Ballista", x: 99, y: 127},
	{stat: "AASite-QuadBof", x: 101, y: 124, rot: 2}, {stat: "Emplacement-Ballista", x: 103, y: 127}, {stat: "WallTower-HvATrocket", x: 105, y: 124},
	{stat: "A0HardcreteMk1Wall", x: 106, y: 124}, {stat: "A0HardcreteMk1Wall", x: 107, y: 124}, {stat: "Wall-RotMg", x: 108, y: 124},
	{stat: "Tower-Projector", x: 115, y: 101, rot: 2}, {stat: "Wall-RotMg", x: 114, y: 102}, {stat: "A0HardcreteMk1Wall", x: 115, y: 102},
	{stat: "A0HardcreteMk1Wall", x: 116, y: 102}, {stat: "WallTower-HvATrocket", x: 117, y: 102}, {stat: "A0HardcreteMk1Wall", x: 118, y: 102},
	{stat: "A0HardcreteMk1Wall", x: 119, y: 102}, {stat: "Emplacement-MRLHvy-pit", x: 113, y: 105}, {stat: "Emplacement-MRLHvy-pit", x: 115, y: 104},
	{stat: "Emplacement-MRLHvy-pit", x: 115, y: 110}, {stat: "Emplacement-MRLHvy-pit", x: 117, y: 105}, {stat: "Emplacement-MRLHvy-pit", x: 119, y: 104},
	{stat: "Emplacement-MRLHvy-pit", x: 116, y: 109}, {stat: "Sys-SensoTower02", x: 117, y: 108}, {stat: "AASite-QuadBof", x: 117, y: 111},
	{stat: "AASite-QuadBof", x: 118, y: 110, rot: 1}, {stat: "WallTower-HvATrocket", x: 120, y: 102}, {stat: "A0HardcreteMk1Wall", x: 121, y: 102},
	{stat: "Tower-Projector", x: 122, y: 101, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 122, y: 102}, {stat: "Wall-RotMg", x: 123, y: 102},
	{stat: "Tower-Projector", x: 126, y: 100, rot: 1}, {stat: "Emplacement-MRLHvy-pit", x: 121, y: 105}, {stat: "Emplacement-MRLHvy-pit", x: 123, y: 104},
	{stat: "Wall-RotMg", x: 113, y: 124}, {stat: "A0HardcreteMk1Wall", x: 114, y: 124}, {stat: "A0HardcreteMk1Wall", x: 115, y: 124},
	{stat: "WallTower-HvATrocket", x: 116, y: 124}, {stat: "Tower-Projector", x: 84, y: 131}, {stat: "Tower-Projector", x: 87, y: 131},
	{stat: "Emplacement-Ballista", x: 99, y: 129}, {stat: "Emplacement-Ballista", x: 101, y: 128}, {stat: "Emplacement-Ballista", x: 103, y: 129},
	{stat: "Tower-Projector", x: 108, y: 130}, {stat: "PillBoxTK", x: 111, y: 128}, {stat: "Tower-Projector", x: 113, y: 130},
	{stat: "Emplacement-MRLHvy-pit", x: 117, y: 128}, {stat: "Emplacement-MRLHvy-pit", x: 118, y: 129}, {stat: "Emplacement-MRLHvy-pit", x: 120, y: 130},
	{stat: "Tower-Projector", x: 128, y: 102, rot: 2}, {stat: "GuardTower-RotMg", x: 133, y: 102}, {stat: "Pillbox-RotMG", x: 131, y: 110},
	{stat: "Pillbox-RotMG", x: 135, y: 111}, {stat: "PillBoxTK", x: 137, y: 101}, {stat: "Emplacement-MRLHvy-pit", x: 138, y: 102},
	{stat: "Wall-RotMg", x: 141, y: 100}, {stat: "Emplacement-MRLHvy-pit", x: 140, y: 102}, {stat: "A0HardcreteMk1Wall", x: 142, y: 100},
	{stat: "A0HardcreteMk1Wall", x: 143, y: 100}, {stat: "Emplacement-MRLHvy-pit", x: 142, y: 103}, {stat: "AASite-QuadBof", x: 138, y: 105},
	{stat: "AASite-QuadBof", x: 140, y: 105}, {stat: "Pillbox-RotMG", x: 140, y: 110}, {stat: "TankTrapC", x: 131, y: 112},
	{stat: "AASite-QuadBof", x: 132, y: 112, rot: 2}, {stat: "TankTrapC", x: 132, y: 113}, {stat: "TankTrapC", x: 133, y: 112},
	{stat: "TankTrapC", x: 135, y: 113}, {stat: "Tower-Projector", x: 132, y: 118}, {stat: "Tower-Projector", x: 132, y: 127, rot: 1},
	{stat: "TankTrapC", x: 136, y: 112}, {stat: "AASite-QuadBof", x: 136, y: 113, rot: 2}, {stat: "TankTrapC", x: 137, y: 113},
	{stat: "TankTrapC", x: 139, y: 112}, {stat: "AASite-QuadBof", x: 140, y: 112, rot: 2}, {stat: "TankTrapC", x: 140, y: 113},
	{stat: "TankTrapC", x: 141, y: 112}, {stat: "TankTrapC", x: 143, y: 113}, {stat: "WallTower-HvATrocket", x: 139, y: 124},
	{stat: "A0HardcreteMk1Wall", x: 140, y: 124}, {stat: "A0HardcreteMk1Wall", x: 141, y: 124}, {stat: "Emplacement-MRLHvy-pit", x: 140, y: 126},
	{stat: "WallTower-HvATrocket", x: 142, y: 124}, {stat: "A0HardcreteMk1Wall", x: 143, y: 124}, {stat: "Emplacement-MRLHvy-pit", x: 142, y: 127},
	{stat: "Wall-RotMg", x: 144, y: 100}, {stat: "Emplacement-MRLHvy-pit", x: 144, y: 103}, {stat: "Tower-Projector", x: 149, y: 101, rot: 2},
	{stat: "GuardTower6H", x: 150, y: 103}, {stat: "PillBoxTK", x: 151, y: 102}, {stat: "GuardTower6H", x: 145, y: 106},
	{stat: "Pillbox-RotMG", x: 145, y: 111}, {stat: "Sys-SensoTower02", x: 152, y: 102}, {stat: "AASite-QuadBof", x: 154, y: 103, rot: 1},
	{stat: "AASite-QuadBof", x: 153, y: 104}, {stat: "TankTrapC", x: 144, y: 112}, {stat: "AASite-QuadBof", x: 144, y: 113, rot: 2},
	{stat: "TankTrapC", x: 145, y: 113}, {stat: "A0HardcreteMk1Wall", x: 144, y: 124}, {stat: "Wall-RotMg", x: 145, y: 124},
	{stat: "Emplacement-MRLHvy-pit", x: 144, y: 126}, {stat: "Wall-RotMg", x: 150, y: 124}, {stat: "A0HardcreteMk1Wall", x: 151, y: 124},
	{stat: "Emplacement-MRLHvy-pit", x: 151, y: 126}, {stat: "Tower-Projector", x: 155, y: 116}, {stat: "WallTower-HvATrocket", x: 152, y: 124},
	{stat: "A0HardcreteMk1Wall", x: 153, y: 124}, {stat: "Emplacement-MRLHvy-pit", x: 152, y: 127}, {stat: "A0HardcreteMk1Wall", x: 154, y: 124},
	{stat: "WallTower-HvATrocket", x: 155, y: 124}, {stat: "Emplacement-MRLHvy-pit", x: 154, y: 126}, {stat: "Emplacement-Ballista", x: 162, y: 100},
	{stat: "Emplacement-Ballista", x: 162, y: 102}, {stat: "Sys-SensoTower02", x: 164, y: 99}, {stat: "AASite-QuadBof", x: 165, y: 100, rot: 2},
	{stat: "AASite-QuadBof", x: 166, y: 102, rot: 1}, {stat: "Emplacement-Ballista", x: 162, y: 104}, {stat: "Emplacement-Ballista", x: 162, y: 106},
	{stat: "Emplacement-MRLHvy-pit", x: 165, y: 104}, {stat: "Emplacement-MRLHvy-pit", x: 165, y: 107}, {stat: "Emplacement-MRLHvy-pit", x: 167, y: 104},
	{stat: "GuardTower6H", x: 169, y: 103}, {stat: "Emplacement-MRLHvy-pit", x: 169, y: 106}, {stat: "Pillbox-RotMG", x: 171, y: 104},
	{stat: "WallTower-HvATrocket", x: 172, y: 105}, {stat: "Tower-Projector", x: 173, y: 108, rot: 1}, {stat: "WallTower-HvATrocket", x: 162, y: 118},
	{stat: "A0HardcreteMk1Wall", x: 163, y: 118}, {stat: "A0HardcreteMk1Wall", x: 164, y: 118}, {stat: "Wall-RotMg", x: 165, y: 118},
	{stat: "A0HardcreteMk1Wall", x: 166, y: 118}, {stat: "Wall-RotMg", x: 167, y: 118}, {stat: "Tower-Projector", x: 163, y: 121, rot: 3},
	{stat: "Tower-Projector", x: 163, y: 124, rot: 3}, {stat: "Emplacement-MRLHvy-pit", x: 166, y: 120}, {stat: "AASite-QuadBof", x: 166, y: 125, rot: 3},
	{stat: "AASite-QuadBof", x: 167, y: 124, rot: 3}, {stat: "AASite-QuadBof", x: 167, y: 127, rot: 3}, {stat: "Wall-RotMg", x: 172, y: 118},
	{stat: "A0HardcreteMk1Wall", x: 173, y: 118}, {stat: "Sys-SensoTower02", x: 173, y: 119}, {stat: "Wall-RotMg", x: 174, y: 118},
	{stat: "A0HardcreteMk1Wall", x: 175, y: 118}, {stat: "Emplacement-Ballista", x: 173, y: 121}, {stat: "Emplacement-Ballista", x: 172, y: 123},
	{stat: "Emplacement-MRLHvy-pit", x: 175, y: 120}, {stat: "Emplacement-Ballista", x: 174, y: 123}, {stat: "Tower-Projector", x: 176, y: 111, rot: 2},
	{stat: "WallTower-HvATrocket", x: 179, y: 112}, {stat: "A0HardcreteMk1Wall", x: 176, y: 118}, {stat: "WallTower-HvATrocket", x: 177, y: 118},
	{stat: "Emplacement-MRLHvy-pit", x: 177, y: 120}, {stat: "Emplacement-Ballista", x: 176, y: 122}, {stat: "AASite-QuadBof", x: 179, y: 121, rot: 2},
	{stat: "AASite-QuadBof", x: 178, y: 122, rot: 2},
	{stat: "AASite-QuadBof", x: 181, y: 122, rot: 2}, {stat: "AASite-QuadBof", x: 182, y: 121, rot: 2}, {stat: "Tower-Projector", x: 188, y: 123, rot: 1},
	{stat: "Tower-Projector", x: 192, y: 125, rot: 2}, {stat: "Tower-Projector", x: 132, y: 130, rot: 1}, {stat: "AASite-QuadBof", x: 166, y: 128, rot: 3},
];
const camA3L9FoxtrotLZ1Structs = [
	{stat: "A0RepairCentre3", x: 86, y: 127}, {stat: "WallTower-HvATrocket", x: 92, y: 126}, {stat: "WallTower-HvATrocket", x: 96, y: 126},
	{stat: "A0RepairCentre3", x: 89, y: 128}, {stat: "WallTower-HvATrocket", x: 92, y: 130}, {stat: "WallTower-HvATrocket", x: 96, y: 130},
];
const camA3L9FoxtrotLZ2Structs = [ 
	{stat: "Tower-Projector", x: 176, y: 127, rot: 3}, {stat: "WallTower-HvATrocket", x: 178, y: 125}, {stat: "Tower-Projector", x: 180, y: 124, rot: 2},
	{stat: "WallTower-HvATrocket", x: 182, y: 125}, {stat: "Tower-Projector", x: 184, y: 127, rot: 1}, {stat: "A0RepairCentre3", x: 172, y: 129},
	{stat: "A0RepairCentre3", x: 175, y: 130}, {stat: "WallTower-HvATrocket", x: 178, y: 129}, {stat: "AASite-QuadBof", x: 180, y: 130},
	{stat: "WallTower-HvATrocket", x: 182, y: 129},
];
const camA3L9GolfDefenseStructs = [
	{stat: "WallTower-HPVcannon", x: 5, y: 30}, {stat: "A0HardcreteMk1Wall", x: 5, y: 31, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 5, y: 32, rot: 1},
	{stat: "WallTower-HPVcannon", x: 5, y: 33}, {stat: "PillBoxTK", x: 6, y: 32}, {stat: "WallTower-HPVcannon", x: 7, y: 44},
	{stat: "A0HardcreteMk1Wall", x: 7, y: 45, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 7, y: 46, rot: 1}, {stat: "WallTower-HPVcannon", x: 7, y: 47},
	{stat: "WallTower-HPVcannon", x: 11, y: 34}, {stat: "A0HardcreteMk1Wall", x: 12, y: 34}, {stat: "WallTower-HPVcannon", x: 13, y: 34},
	{stat: "WallTower-HPVcannon", x: 8, y: 43}, {stat: "A0HardcreteMk1Wall", x: 9, y: 43}, {stat: "A0HardcreteMk1Wall", x: 10, y: 43},
	{stat: "WallTower-HPVcannon", x: 11, y: 43}, {stat: "AASite-QuadBof", x: 9, y: 46}, {stat: "Emplacement-RotMor", x: 10, y: 44},
	{stat: "AASite-QuadBof", x: 10, y: 47}, {stat: "PillBoxTK", x: 13, y: 41}, {stat: "PillBoxHPC", x: 12, y: 42},
	{stat: "PillBoxHPC", x: 15, y: 42}, {stat: "Emplacement-Howitzer105", x: 13, y: 44}, {stat: "Emplacement-Howitzer105", x: 13, y: 46},
	{stat: "Emplacement-Howitzer105", x: 15, y: 45}, {stat: "Emplacement-Howitzer105", x: 15, y: 47}, {stat: "AASite-QuadBof", x: 5, y: 56},
	{stat: "Emplacement-Howitzer105", x: 15, y: 49}, {stat: "AASite-QuadBof", x: 9, y: 57},
	{stat: "AASite-QuadBof", x: 11, y: 57}, {stat: "Emplacement-RotMor", x: 10, y: 59}, {stat: "Emplacement-RotMor", x: 11, y: 61},
	{stat: "WallTower-HPVcannon", x: 10, y: 63}, {stat: "A0HardcreteMk1Wall", x: 11, y: 63}, {stat: "AASite-QuadBof", x: 13, y: 57},
	{stat: "Emplacement-RotMor", x: 12, y: 59}, {stat: "Emplacement-RotMor", x: 13, y: 61}, {stat: "A0HardcreteMk1Wall", x: 12, y: 63},
	{stat: "WallTower-HPVcannon", x: 13, y: 63}, {stat: "Sys-SensoTower02", x: 15, y: 60}, {stat: "PillBoxTK", x: 15, y: 62},
	{stat: "Sys-SensoTower02", x: 17, y: 35}, {stat: "Emplacement-RotMor", x: 17, y: 37}, {stat: "Emplacement-RotMor", x: 19, y: 37},
	{stat: "Emplacement-RotMor", x: 18, y: 39}, {stat: "AASite-QuadBof", x: 21, y: 37, rot: 1}, {stat: "Emplacement-RotMor", x: 20, y: 39},
	{stat: "AASite-QuadBof", x: 22, y: 39, rot: 1}, {stat: "Sys-SensoTower02", x: 16, y: 43}, {stat: "Sys-CB-Tower01", x: 17, y: 47},
	{stat: "WallTower-HPVcannon", x: 18, y: 44}, {stat: "A0HardcreteMk1Wall", x: 19, y: 44}, {stat: "Emplacement-RotMor", x: 19, y: 47},
	{stat: "Wall-VulcanCan", x: 20, y: 44}, {stat: "A0HardcreteMk1Wall", x: 21, y: 44}, {stat: "Emplacement-RotMor", x: 21, y: 47},
	{stat: "WallTower-HPVcannon", x: 22, y: 44}, {stat: "WallTower-HPVcannon", x: 24, y: 46}, {stat: "A0HardcreteMk1Wall", x: 24, y: 47, rot: 1},
	{stat: "Emplacement-RotMor", x: 18, y: 49}, {stat: "WallTower-HPVcannon", x: 19, y: 51}, {stat: "Emplacement-RotMor", x: 20, y: 49},
	{stat: "A0HardcreteMk1Wall", x: 20, y: 51}, {stat: "Wall-VulcanCan", x: 21, y: 51}, {stat: "Emplacement-RotMor", x: 22, y: 49},
	{stat: "Sys-SensoTower02", x: 23, y: 48}, {stat: "A0HardcreteMk1Wall", x: 22, y: 51}, {stat: "WallTower-HPVcannon", x: 23, y: 51},
	{stat: "PillBoxTK", x: 20, y: 53, rot: 1}, {stat: "Emplacement-RotMor", x: 16, y: 58}, {stat: "WallTower-HPVcannon", x: 18, y: 57},
	{stat: "PillBoxTK", x: 19, y: 57, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 18, y: 58, rot: 1}, {stat: "WallTower-HPVcannon", x: 18, y: 59},
	{stat: "PillBoxTK", x: 17, y: 60}, {stat: "Wall-VulcanCan", x: 24, y: 48}, {stat: "A0HardcreteMk1Wall", x: 24, y: 49, rot: 1},
	{stat: "WallTower-HPVcannon", x: 24, y: 50}, {stat: "AASite-QuadBof", x: 26, y: 54, rot: 1}, {stat: "Emplacement-Ballista", x: 28, y: 52},
	{stat: "Emplacement-RotMor", x: 28, y: 54}, {stat: "Emplacement-RotMor", x: 30, y: 53}, {stat: "Emplacement-RotMor", x: 30, y: 55},
	{stat: "AASite-QuadBof", x: 25, y: 57, rot: 1}, {stat: "Emplacement-RotMor", x: 28, y: 56}, {stat: "Emplacement-Ballista", x: 28, y: 58},
	{stat: "Emplacement-RotMor", x: 30, y: 57}, {stat: "WallTower-HPVcannon", x: 32, y: 53}, {stat: "A0HardcreteMk1Wall", x: 32, y: 54, rot: 3},
	{stat: "Wall-VulcanCan", x: 32, y: 55}, {stat: "A0HardcreteMk1Wall", x: 32, y: 56, rot: 3}, {stat: "WallTower-HPVcannon", x: 32, y: 57},
	{stat: "PillBoxTK", x: 33, y: 59}, {stat: "Emplacement-Howitzer105", x: 8, y: 83}, {stat: "Emplacement-Howitzer105", x: 10, y: 83},
	{stat: "Emplacement-Howitzer105", x: 8, y: 85}, {stat: "Emplacement-Howitzer105", x: 8, y: 87}, {stat: "Emplacement-Howitzer105", x: 10, y: 85},
	{stat: "Emplacement-Howitzer105", x: 10, y: 87}, {stat: "AASite-QuadBof", x: 12, y: 84, rot: 1}, {stat: "AASite-QuadBof", x: 12, y: 86, rot: 1},
	{stat: "AASite-QuadBof", x: 14, y: 85, rot: 1}, {stat: "AASite-QuadBof", x: 14, y: 87, rot: 1}, {stat: "Emplacement-Howitzer105", x: 8, y: 89},
	{stat: "Emplacement-Howitzer105", x: 10, y: 89}, {stat: "AASite-QuadBof", x: 12, y: 88, rot: 1}, {stat: "AASite-QuadBof", x: 23, y: 65},
	{stat: "Emplacement-Ballista", x: 17, y: 79}, {stat: "Emplacement-RotMor", x: 19, y: 79}, {stat: "WallTower-HPVcannon", x: 22, y: 79},
	{stat: "AASite-QuadBof", x: 25, y: 64}, {stat: "Sys-SensoTower02", x: 30, y: 65}, {stat: "PillBoxHPC", x: 31, y: 66},
	{stat: "PillBoxHPC", x: 29, y: 68}, {stat: "Emplacement-Ballista", x: 17, y: 83}, {stat: "Emplacement-RotMor", x: 18, y: 81},
	{stat: "Emplacement-RotMor", x: 19, y: 83}, {stat: "Emplacement-RotMor", x: 18, y: 85}, {stat: "Sys-SensoTower02", x: 21, y: 82},
	{stat: "A0HardcreteMk1Wall", x: 22, y: 80, rot: 1}, {stat: "Wall-VulcanCan", x: 22, y: 81}, {stat: "A0HardcreteMk1Wall", x: 22, y: 82, rot: 1},
	{stat: "Wall-VulcanCan", x: 22, y: 83}, {stat: "A0HardcreteMk1Wall", x: 22, y: 84, rot: 1}, {stat: "WallTower-HPVcannon", x: 22, y: 85},
	{stat: "AASite-QuadBof", x: 18, y: 91, rot: 1}, {stat: "AASite-QuadBof", x: 18, y: 93, rot: 1}, {stat: "AASite-QuadBof", x: 19, y: 95, rot: 1},
	{stat: "WallTower-HPVcannon", x: 11, y: 100}, {stat: "A0HardcreteMk1Wall", x: 11, y: 101, rot: 1}, {stat: "Wall-VulcanCan", x: 11, y: 102},
	{stat: "A0HardcreteMk1Wall", x: 11, y: 103, rot: 1}, {stat: "AASite-QuadBof", x: 15, y: 103, rot: 2}, {stat: "WallTower-HPVcannon", x: 8, y: 104},
	{stat: "A0HardcreteMk1Wall", x: 9, y: 104}, {stat: "A0HardcreteMk1Wall", x: 10, y: 104}, {stat: "WallTower-HPVcannon", x: 11, y: 104},
	{stat: "AASite-QuadBof", x: 13, y: 110, rot: 2}, {stat: "AASite-QuadBof", x: 11, y: 112, rot: 2}, {stat: "AASite-QuadBof", x: 15, y: 112, rot: 2},
	{stat: "AASite-QuadBof", x: 17, y: 104, rot: 2}, {stat: "Emplacement-Ballista", x: 19, y: 109}, {stat: "AASite-QuadBof", x: 20, y: 105, rot: 2},
	{stat: "Emplacement-Ballista", x: 20, y: 107}, {stat: "Sys-SensoTower02", x: 23, y: 104}, {stat: "Emplacement-Ballista", x: 22, y: 107},
	{stat: "Sys-CB-Tower01", x: 21, y: 109}, {stat: "Emplacement-Ballista", x: 20, y: 111}, {stat: "Emplacement-Ballista", x: 23, y: 109},
	{stat: "Emplacement-Ballista", x: 22, y: 111}, {stat: "PillBoxHPC", x: 28, y: 105}, {stat: "PillBoxHPC", x: 30, y: 107},
	{stat: "WallTower-HPVcannon", x: 31, y: 109}, {stat: "A0HardcreteMk1Wall", x: 31, y: 110, rot: 1}, {stat: "Wall-VulcanCan", x: 31, y: 111},
	{stat: "Emplacement-Howitzer105", x: 21, y: 116}, {stat: "Emplacement-Howitzer105", x: 21, y: 118}, {stat: "Emplacement-Howitzer105", x: 23, y: 117},
	{stat: "Emplacement-Howitzer105", x: 23, y: 119},
	{stat: "Emplacement-Howitzer105", x: 21, y: 120}, {stat: "Emplacement-Howitzer105", x: 21, y: 122}, {stat: "Emplacement-Howitzer105", x: 23, y: 121},
	{stat: "Emplacement-Howitzer105", x: 23, y: 123}, {stat: "Emplacement-Howitzer105", x: 21, y: 124}, {stat: "Emplacement-Howitzer105", x: 23, y: 125},
	{stat: "AASite-QuadBof", x: 25, y: 115, rot: 1}, {stat: "AASite-QuadBof", x: 26, y: 117, rot: 1}, {stat: "AASite-QuadBof", x: 26, y: 120, rot: 1},
	{stat: "AASite-QuadBof", x: 26, y: 123, rot: 1}, {stat: "AASite-QuadBof", x: 25, y: 125, rot: 1}, {stat: "Emplacement-RotMor", x: 29, y: 122},
	{stat: "Emplacement-RotMor", x: 30, y: 120}, {stat: "Sys-CB-Tower01", x: 31, y: 122}, {stat: "Emplacement-RotMor", x: 30, y: 124},
	{stat: "PillBoxTK", x: 32, y: 65}, {stat: "PillBoxTK", x: 32, y: 111}, {stat: "Sys-SensoTower02", x: 32, y: 117},
	{stat: "Wall-VulcanCan", x: 33, y: 116}, {stat: "A0HardcreteMk1Wall", x: 33, y: 117, rot: 1}, {stat: "WallTower-HPVcannon", x: 33, y: 118},
	{stat: "PillBoxTK", x: 35, y: 116}, {stat: "A0HardcreteMk1Wall", x: 34, y: 118}, {stat: "WallTower-HPVcannon", x: 35, y: 118},
	{stat: "Emplacement-RotMor", x: 32, y: 120}, {stat: "Emplacement-RotMor", x: 33, y: 122}, {stat: "AASite-QuadBof", x: 35, y: 120, rot: 1},
	{stat: "Emplacement-RotMor", x: 32, y: 124}, {stat: "Emplacement-Ballista", x: 35, y: 124}, {stat: "AASite-QuadBof", x: 36, y: 122, rot: 1},
	{stat: "AASite-QuadBof", x: 37, y: 124, rot: 1}, {stat: "AASite-QuadBof", x: 19, y: 130, rot: 2}, {stat: "AASite-QuadBof", x: 21, y: 129, rot: 2},
	{stat: "AASite-QuadBof", x: 23, y: 130, rot: 2}, {stat: "AASite-QuadBof", x: 25, y: 129, rot: 2},
];
const camA3L9GolfLZ1Structs = [
	{stat: "PillBoxHPC", x: 10, y: 119},
	{stat: "Wall-VulcanCan", x: 8, y: 121},
	{stat: "Wall-VulcanCan", x: 8, y: 125},
	{stat: "Wall-VulcanCan", x: 12, y: 121},
	{stat: "PillBoxHPC", x: 14, y: 123},
	{stat: "Wall-VulcanCan", x: 12, y: 125},
	{stat: "A0RepairCentre3", x: 16, y: 121},
	{stat: "A0RepairCentre3", x: 17, y: 123},
];
const camA3L9GolfLZ2Structs = [
	{stat: "PillBoxTK", x: 3, y: 48},
	{stat: "Wall-VulcanCan", x: 4, y: 50},
	{stat: "Wall-VulcanCan", x: 4, y: 54},
	{stat: "Wall-VulcanCan", x: 8, y: 50},
	{stat: "A0RepairCentre3", x: 11, y: 51},
	{stat: "Wall-VulcanCan", x: 8, y: 54},
	{stat: "Emplacement-Howitzer105", x: 13, y: 48},
	{stat: "A0RepairCentre3", x: 13, y: 53},
];

// A4L2
// Delta forward base structures
const camA4L2DeltaUplinkStructs = [
	{stat: "Wall-VulcanCan", x: 72, y: 61}, {stat: "A0HardcreteMk1Wall", x: 73, y: 61}, {stat: "A0HardcreteMk1Wall", x: 72, y: 62, rot: 1},
	{stat: "Wall-RotMg", x: 72, y: 63}, {stat: "A0HardcreteMk1Wall", x: 74, y: 61}, {stat: "Wall-RotMg", x: 75, y: 61},
	{stat: "PillBoxHPC", x: 78, y: 59}, {stat: "AASite-QuadBof", x: 78, y: 62, rot: 2}, {stat: "Wall-RotMg", x: 80, y: 59},
	{stat: "A0HardcreteMk1Wall", x: 81, y: 59}, {stat: "A0HardcreteMk1Wall", x: 82, y: 59}, {stat: "Wall-VulcanCan", x: 83, y: 59},
	{stat: "AASite-QuadBof", x: 81, y: 62, rot: 2}, {stat: "Pillbox-RotMG", x: 84, y: 61}, {stat: "A0HardcreteMk1Wall", x: 72, y: 64, rot: 1},
	{stat: "Wall-VulcanCan", x: 72, y: 65}, {stat: "Sys-SensoTower02", x: 73, y: 64}, {stat: "PillBoxHPC", x: 74, y: 67},
	{stat: "Wall-VulcanCan", x: 74, y: 70}, {stat: "A0HardcreteMk1Wall", x: 74, y: 71, rot: 1}, {stat: "AASite-QuadBof", x: 76, y: 64, rot: 3},
	{stat: "AASite-QuadBof", x: 76, y: 67, rot: 3}, {stat: "Sys-CB-Tower01", x: 78, y: 64}, {stat: "AASite-QuadBof", x: 78, y: 69},
	{stat: "Wall-VulcanCan", x: 74, y: 72}, {stat: "A0HardcreteMk1Wall", x: 75, y: 72}, {stat: "Wall-RotMg", x: 76, y: 72},
	{stat: "A0HardcreteMk1Wall", x: 77, y: 72}, {stat: "Wall-VulcanCan", x: 78, y: 72},
	{stat: "Sys-VTOL-RadarTower02", x: 81, y: 67}, {stat: "Emplacement-RotMor", x: 83, y: 64}, {stat: "Emplacement-RotMor", x: 83, y: 66},
	{stat: "AASite-QuadBof", x: 81, y: 69}, {stat: "GuardTower-RotMg", x: 83, y: 70}, {stat: "Emplacement-RotMor", x: 84, y: 65},
	{stat: "Emplacement-RotMor", x: 84, y: 67}, {stat: "Sys-SensoTower02", x: 86, y: 66}, {stat: "Wall-VulcanCan", x: 84, y: 69},
	{stat: "A0HardcreteMk1Wall", x: 84, y: 70, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 84, y: 71, rot: 1}, {stat: "Wall-VulcanCan", x: 81, y: 72},
	{stat: "A0HardcreteMk1Wall", x: 82, y: 72}, {stat: "A0HardcreteMk1Wall", x: 83, y: 72}, {stat: "Wall-VulcanCan", x: 84, y: 72},
];
const camA4L2DeltaOutpostStructs = [
	{stat: "Wall-RotMg", x: 55, y: 46}, {stat: "A0HardcreteMk1Wall", x: 55, y: 47, rot: 1}, {stat: "Wall-VulcanCan", x: 58, y: 42},
	{stat: "A0HardcreteMk1Wall", x: 59, y: 42}, {stat: "Emplacement-RotMor", x: 59, y: 45}, {stat: "A0HardcreteMk1Wall", x: 60, y: 42},
	{stat: "Wall-VulcanCan", x: 61, y: 42}, {stat: "PillBoxHPC", x: 62, y: 43}, {stat: "Emplacement-RotMor", x: 60, y: 47},
	{stat: "GuardTower-RotMg", x: 63, y: 44}, {stat: "A0HardcreteMk1Wall", x: 55, y: 48, rot: 1}, {stat: "Wall-VulcanCan", x: 55, y: 49},
	{stat: "AASite-QuadBof", x: 54, y: 51, rot: 3}, {stat: "AASite-QuadBof", x: 53, y: 53, rot: 3}, {stat: "GuardTower-RotMg", x: 54, y: 56},
	{stat: "Emplacement-Howitzer105", x: 56, y: 53}, {stat: "Emplacement-RotMor", x: 56, y: 55}, {stat: "Emplacement-Howitzer105", x: 58, y: 52},
	{stat: "Emplacement-Howitzer105", x: 58, y: 54}, {stat: "AASite-QuadBof", x: 60, y: 50, rot: 3}, {stat: "Sys-CB-Tower01", x: 61, y: 50},
	{stat: "AASite-QuadBof", x: 61, y: 51}, {stat: "Emplacement-RotMor", x: 62, y: 48}, {stat: "Emplacement-Howitzer105", x: 60, y: 53},
	{stat: "Emplacement-RotMor", x: 60, y: 55}, {stat: "Sys-VTOL-RadarTower02", x: 63, y: 54}, {stat: "Pillbox-RotMG", x: 56, y: 57},
	{stat: "Sys-SensoTower02", x: 60, y: 57}, {stat: "GuardTower-RotMg", x: 62, y: 56}, {stat: "PillBoxHPC", x: 64, y: 45},
	{stat: "Wall-VulcanCan", x: 65, y: 47}, {stat: "A0HardcreteMk1Wall", x: 65, y: 48, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 65, y: 49, rot: 1},
	{stat: "Wall-RotMg", x: 65, y: 50}, {stat: "Wall-RotMg", x: 64, y: 53}, {stat: "A0HardcreteMk1Wall", x: 64, y: 54, rot: 1},
	{stat: "Wall-VulcanCan", x: 64, y: 55}, {stat: "Pillbox-RotMG", x: 65, y: 54},
];
const camA4L2DeltaOverlookStructs = [
	{stat: "Pillbox-RotMG", x: 93, y: 5}, {stat: "Emplacement-RotMor", x: 94, y: 7}, {stat: "PillBoxHPC", x: 90, y: 8},
	{stat: "Pillbox-RotMG", x: 91, y: 11}, {stat: "Emplacement-RotMor", x: 92, y: 8}, {stat: "Emplacement-RotMor", x: 93, y: 10},
	{stat: "Emplacement-RotMor", x: 95, y: 9}, {stat: "GuardTower-RotMg", x: 96, y: 7}, {stat: "AASite-QuadBof", x: 96, y: 11},
	{stat: "PillBoxHPC", x: 97, y: 10}, {stat: "Sys-CB-Tower01", x: 94, y: 8},
];

// A4L3
// Foxtrot and Golf forward base structures
const camA4L3GolfForwardBaseStructs = [
	{stat: "PillBoxHPC", x: 91, y: 111}, {stat: "WallTower04", x: 94, y: 108}, {stat: "A0HardcreteMk1Gate", x: 94, y: 109, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 95, y: 108}, {stat: "A0HardcreteMk1Gate", x: 94, y: 110, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 94, y: 111, rot: 1},
	{stat: "WallTower04", x: 87, y: 115}, {stat: "PillBoxHPC", x: 85, y: 119}, {stat: "A0HardcreteMk1Gate", x: 87, y: 116, rot: 1},
	{stat: "A0HardcreteMk1Gate", x: 87, y: 117, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 87, y: 118, rot: 1}, {stat: "WallTower04", x: 87, y: 119},
	{stat: "WallTower04", x: 84, y: 121}, {stat: "A0HardcreteMk1Wall", x: 85, y: 121}, {stat: "A0HardcreteMk1Wall", x: 86, y: 121, rot: 2},
	{stat: "A0HardcreteMk1Wall", x: 87, y: 120, rot: 1}, {stat: "WallTower-HvATrocket", x: 87, y: 121}, {stat: "Sys-SensoTower02", x: 88, y: 113},
	{stat: "WallTower04", x: 89, y: 112}, {stat: "A0HardcreteMk1Wall", x: 90, y: 112}, {stat: "WallTower-HvATrocket", x: 91, y: 112},
	{stat: "Emplacement-Rocket06-IDF", x: 90, y: 114}, {stat: "Emplacement-Rocket06-IDF", x: 91, y: 116}, {stat: "A0HardcreteMk1Wall", x: 92, y: 112},
	{stat: "A0HardcreteMk1Wall", x: 93, y: 112}, {stat: "Emplacement-Rocket06-IDF", x: 92, y: 114}, {stat: "Sys-CB-Tower01", x: 92, y: 115},
	{stat: "WallTower04", x: 94, y: 112}, {stat: "Emplacement-Rocket06-IDF", x: 94, y: 114}, {stat: "Emplacement-Rocket06-IDF", x: 93, y: 116},
	{stat: "A0HardcreteMk1Wall", x: 88, y: 121, rot: 2}, {stat: "AASite-QuadBof", x: 89, y: 120, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 89, y: 121, rot: 2},
	{stat: "WallTower04", x: 90, y: 121}, {stat: "AASite-QuadBof", x: 91, y: 120, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 91, y: 121},
	{stat: "A0HardcreteMk1Wall", x: 92, y: 121}, {stat: "WallTower04", x: 93, y: 121}, {stat: "A0HardcreteMk1Gate", x: 94, y: 121},
	{stat: "A0HardcreteMk1Gate", x: 95, y: 121}, {stat: "A0HardcreteMk1Wall", x: 96, y: 108}, {stat: "AASite-QuadBof", x: 96, y: 109},
	{stat: "WallTower-HvATrocket", x: 97, y: 108}, {stat: "A0HardcreteMk1Wall", x: 98, y: 108}, {stat: "AASite-QuadBof", x: 98, y: 109},
	{stat: "A0HardcreteMk1Wall", x: 99, y: 108}, {stat: "WallTower04", x: 100, y: 108}, {stat: "A0HardcreteMk1Wall", x: 100, y: 109, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 100, y: 110, rot: 1}, {stat: "WallTower04", x: 100, y: 111}, {stat: "A0HardcreteMk1Wall", x: 101, y: 111},
	{stat: "A0HardcreteMk1Wall", x: 102, y: 111}, {stat: "A0HardcreteMk1Wall", x: 103, y: 111}, {stat: "WallTower04", x: 104, y: 111},
	{stat: "Emplacement-RotMor", x: 99, y: 113}, {stat: "Emplacement-Ballista", x: 98, y: 115}, {stat: "WallTower04", x: 97, y: 119},
	{stat: "Emplacement-RotMor", x: 99, y: 117}, {stat: "A0HardcreteMk1Wall", x: 98, y: 119}, {stat: "A0HardcreteMk1Wall", x: 99, y: 119},
	{stat: "A0RepairCentre3", x: 101, y: 113}, {stat: "AASite-QuadBof", x: 103, y: 114, rot: 3}, {stat: "A0RepairCentre3", x: 101, y: 117},
	{stat: "WallTower-HvATrocket", x: 100, y: 119}, {stat: "A0HardcreteMk1Wall", x: 101, y: 119}, {stat: "AASite-QuadBof", x: 103, y: 116, rot: 3},
	{stat: "A0HardcreteMk1Wall", x: 102, y: 119}, {stat: "A0HardcreteMk1Wall", x: 103, y: 119}, {stat: "A0HardcreteMk1Gate", x: 96, y: 121},
	{stat: "A0HardcreteMk1Wall", x: 97, y: 120, rot: 1}, {stat: "WallTower04", x: 97, y: 121}, {stat: "A0HardcreteMk1Wall", x: 104, y: 112, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 104, y: 113, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 104, y: 114, rot: 1}, {stat: "WallTower-HvATrocket", x: 104, y: 115},
	{stat: "A0HardcreteMk1Wall", x: 104, y: 116, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 104, y: 117, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 104, y: 118, rot: 1},
	{stat: "WallTower04", x: 104, y: 119},
];
const camA4L3FoxtrotForwardStructs1 = [
	{stat: "PillBoxTK", x: 116, y: 27}, {stat: "AASite-QuadBof", x: 117, y: 26}, {stat: "GuardTower6H", x: 118, y: 25},
	{stat: "Emplacement-Ballista", x: 119, y: 26}, {stat: "TankTrapC", x: 116, y: 28}, {stat: "TankTrapC", x: 116, y: 29},
	{stat: "GuardTower-RotMg", x: 117, y: 29}, {stat: "Tower-Projector", x: 116, y: 30}, {stat: "GuardTower6H", x: 122, y: 23},
	{stat: "Emplacement-MRLHvy-pit", x: 123, y: 23}, {stat: "GuardTower6H", x: 124, y: 23}, {stat: "Sys-SensoTower02", x: 121, y: 24},
	{stat: "Emplacement-Ballista", x: 121, y: 26}, {stat: "Emplacement-Ballista", x: 123, y: 26}, {stat: "Emplacement-Ballista", x: 120, y: 28},
	{stat: "Emplacement-Ballista", x: 122, y: 28}, {stat: "AASite-QuadBof", x: 125, y: 24, rot: 1}, {stat: "Emplacement-MRLHvy-pit", x: 125, y: 26},
	{stat: "Tower-Projector", x: 119, y: 32}, {stat: "TankTrapC", x: 119, y: 33}, {stat: "TankTrapC", x: 119, y: 34}, {stat: "PillBoxTK", x: 119, y: 35},
	{stat: "GuardTower-RotMg", x: 120, y: 33}, {stat: "Emplacement-MRLHvy-pit", x: 122, y: 32}, {stat: "AASite-QuadBof", x: 123, y: 34},
	{stat: "GuardTower6H", x: 125, y: 35}, {stat: "AASite-QuadBof", x: 126, y: 36},
];
const camA4L3FoxtrotForwardStructs2 = [
	{stat: "AASite-QuadBof", x: 98, y: 3}, {stat: "AASite-QuadBof", x: 96, y: 4}, {stat: "GuardTower6H", x: 96, y: 6},
	{stat: "Emplacement-MRLHvy-pit", x: 96, y: 7}, {stat: "A0ResourceExtractor", x: 99, y: 7}, {stat: "AASite-QuadBof", x: 100, y: 4},
	{stat: "PillBoxTK", x: 97, y: 9}, {stat: "GuardTower-RotMg", x: 98, y: 10}, {stat: "TankTrapC", x: 99, y: 11},
	{stat: "Emplacement-MRLHvy-pit", x: 100, y: 10}, {stat: "TankTrapC", x: 100, y: 11}, {stat: "Tower-Projector", x: 101, y: 11},
];
const camA4L3FoxtrotForwardStructs3 = [
	{stat: "Tower-Projector", x: 91, y: 17}, {stat: "Tower-Projector", x: 88, y: 21}, {stat: "TankTrapC", x: 88, y: 22},
	{stat: "TankTrapC", x: 88, y: 23}, {stat: "GuardTower-RotMg", x: 89, y: 23}, {stat: "PillBoxTK", x: 91, y: 20},
	{stat: "TankTrapC", x: 92, y: 17}, {stat: "TankTrapC", x: 93, y: 17}, {stat: "GuardTower-RotMg", x: 92, y: 18},
	{stat: "TankTrapC", x: 94, y: 17}, {stat: "Emplacement-Ballista", x: 92, y: 22}, {stat: "Emplacement-Ballista", x: 94, y: 21},
	{stat: "Emplacement-Ballista", x: 95, y: 23}, {stat: "TankTrapC", x: 88, y: 24}, {stat: "Emplacement-Ballista", x: 93, y: 24},
	{stat: "GuardTower-RotMg", x: 92, y: 26}, {stat: "PillBoxTK", x: 95, y: 26}, {stat: "PillBoxTK", x: 97, y: 23},
	{stat: "Sys-SensoTower02", x: 96, y: 25},
];
const camA4L3FoxtrotForwardStructs4 = [
	{stat: "Sys-SensoTower02", x: 75, y: 29}, {stat: "GuardTower6H", x: 78, y: 28}, {stat: "AASite-QuadBof", x: 78, y: 31},
	{stat: "GuardTower6H", x: 80, y: 28}, {stat: "GuardTower-RotMg", x: 81, y: 29}, {stat: "GuardTower-RotMg", x: 82, y: 30},
	{stat: "GuardTower6H", x: 83, y: 31}, {stat: "Emplacement-Ballista", x: 75, y: 35}, {stat: "AASite-QuadBof", x: 73, y: 36, rot: 3},
	{stat: "TankTrapC", x: 73, y: 37}, {stat: "TankTrapC", x: 73, y: 38}, {stat: "Pillbox-RotMG", x: 73, y: 39},
	{stat: "GuardTower6H", x: 74, y: 37}, {stat: "TankTrapC", x: 74, y: 39}, {stat: "PillBoxTK", x: 75, y: 39},
	{stat: "Emplacement-Ballista", x: 76, y: 33}, {stat: "A0ResourceExtractor", x: 77, y: 35}, {stat: "AASite-QuadBof", x: 79, y: 32},
	{stat: "Emplacement-Ballista", x: 78, y: 34}, {stat: "Emplacement-MRLHvy-pit", x: 76, y: 37}, {stat: "TankTrapC", x: 76, y: 39},
	{stat: "Tower-Projector", x: 77, y: 39}, {stat: "AASite-QuadBof", x: 83, y: 33}, {stat: "GuardTower-RotMg", x: 82, y: 35},
	{stat: "Pillbox-RotMG", x: 83, y: 35}, {stat: "Emplacement-MRLHvy-pit", x: 80, y: 36}, {stat: "Tower-Projector", x: 81, y: 38},
	{stat: "GuardTower6H", x: 82, y: 37}, {stat: "TankTrapC", x: 83, y: 36}, {stat: "TankTrapC", x: 83, y: 37},
	{stat: "TankTrapC", x: 82, y: 38}, {stat: "PillBoxTK", x: 83, y: 38},
];
const camA4L3FoxtrotForwardStructs5 = [
	{stat: "TankTrapC", x: 94, y: 57}, {stat: "TankTrapC", x: 95, y: 57}, {stat: "PillBoxTK", x: 94, y: 58, rot: 3},
	{stat: "TankTrapC", x: 94, y: 59}, {stat: "GuardTower6H", x: 95, y: 59}, {stat: "Tower-Projector", x: 94, y: 60, rot: 3},
	{stat: "AASite-QuadBof", x: 96, y: 57, rot: 2}, {stat: "Emplacement-MRLHvy-pit", x: 97, y: 58}, {stat: "AASite-QuadBof", x: 99, y: 59, rot: 2},
	{stat: "A0ResourceExtractor", x: 97, y: 60}, {stat: "Tower-Projector", x: 96, y: 63, rot: 3}, {stat: "Emplacement-MRLHvy-pit", x: 100, y: 60},
	{stat: "AASite-QuadBof", x: 101, y: 61, rot: 1}, {stat: "AASite-QuadBof", x: 101, y: 63}, {stat: "TankTrapC", x: 96, y: 64},
	{stat: "Pillbox-RotMG", x: 96, y: 65}, {stat: "GuardTower6H", x: 97, y: 64}, {stat: "Sys-SensoTower02", x: 99, y: 65},
	{stat: "AASite-QuadBof", x: 98, y: 66},
];
