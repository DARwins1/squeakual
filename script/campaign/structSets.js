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