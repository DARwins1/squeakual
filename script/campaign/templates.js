var cTempl = {
////////////////////////////////////////////////////////////////////////////////

// Reclamation Campaign
// Player Units:
truck: { body: "Body1REC", prop: "wheeled01", weap: "Spade1Mk1" }, // Truck Viper Wheels

// Scavenger Units:
bloke: { body: "B1BaBaPerson01", prop: "BaBaLegs", weap: "BabaMG" }, // Bloke
trike: { body: "B4body-sml-trike01", prop: "BaBaProp", weap: "BabaTrikeMG" }, // Trike
buggy: { body: "B3body-sml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" }, // Buggy
bjeep: { body: "B2JeepBody", prop: "BaBaProp", weap: "BabaJeepMG" }, // Jeep
rbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaRocket" }, // Rocket Jeep
rbuggy: { body: "B3bodyRKbuggy01", prop: "BaBaProp", weap: "BabaRocket" }, // Rocket Buggy
civ: { body: "CivilianBody", prop: "BaBaLegs", weap: "BabaMG" }, // Civilian
helcan: { body: "ScavengerChopper", prop: "Helicopter", weap: "RustCannon1-VTOL" }, // Light Cannon Helicopter
helhmg: { body: "ScavengerChopper", prop: "Helicopter", weap: "RustMG3-VTOL" }, // HMG Helicopter
moncan: { body: "MonsterBus", prop: "tracked01", weap: "RustCannon1Mk1" }, // Light Cannon Monster Bus Tank
monhmg: { body: "MonsterBus", prop: "tracked01", weap: "RustMG3Mk1" }, // HMG Monster Bus Tank
monmrl: { body: "MonsterBus", prop: "tracked01", weap: "RustRocket-MRL" }, // MRA Monster Bus Tank
monsar: { body: "MonsterBus", prop: "tracked01", weap: "RustRocket-LtA-TMk1" }, // Sarissa Monster Bus Tank
buscan: { body: "BusBody", prop: "BaBaProp", weap: "RustCannon1Mk1" }, // Light Cannon school bus
firetruck: { body: "FireBody", prop: "BaBaProp", weap: "RustFlame1Mk1" }, // Flamer firetruck
minitruck: { body: "FireBody", prop: "BaBaProp", weap: "RustRocket-Pod" }, // Mini-Rocket Pod firetruck
sartruck: { body: "FireBody", prop: "BaBaProp", weap: "RustRocket-LtA-TMk1" }, // Sarissa firetruck
lance: { body: "BaBaLanceBody", prop: "BaBaLegs", weap: "BabaLance" }, // Rocket scav

// Infested Units:
infciv: { body: "InfestedCivilianBody", prop: "BaBaLegs", weap: "InfestedMelee" }, // Infested civilian (melee unit)
infbloke: { body: "InfestedScavBody", prop: "BaBaLegs", weap: "BabaMG" }, // Infested bloke
inflance: { body: "InfestedLanceBody", prop: "BaBaLegs", weap: "BabaLance" }, // Infested rocket scav
infhelcan: { body: "InfestedScavengerChopper", prop: "Helicopter", weap: "RustCannon1-VTOL" }, // Infested Light Cannon Helicopter
infhelhmg: { body: "InfestedScavengerChopper", prop: "Helicopter", weap: "RustMG3-VTOL" }, // Infested HMG Helicopter
infmoncan: { body: "InfestedMonsterBus", prop: "tracked01", weap: "RustCannon1Mk1" }, // Infested Light Cannon Monster Bus Tank
infmonhmg: { body: "InfestedMonsterBus", prop: "tracked01", weap: "RustMG3Mk1" }, // Infested HMG Monster Bus Tank
infmonmrl: { body: "InfestedMonsterBus", prop: "tracked01", weap: "RustRocket-MRL" }, // Infested MRL Monster Bus Tank
infmonsar: { body: "InfestedMonsterBus", prop: "tracked01", weap: "RustRocket-LtA-TMk1" }, // Infested Sarissa Monster Bus Tank
infbuscan: { body: "InfestedBusBody", prop: "BaBaProp", weap: "RustCannon1Mk1" }, // Infested Light Cannon school bus
inffiretruck: { body: "InfestedFireBody", prop: "BaBaProp", weap: "RustFlame1Mk1" }, // Infested Flamer firetruck
infminitruck: { body: "InfestedFireBody", prop: "BaBaProp", weap: "RustRocket-Pod" }, // Infested Mini-Rocket Pod firetruck
infsartruck: { body: "InfestedFireBody", prop: "BaBaProp", weap: "RustRocket-LtA-TMk1" }, // Infested Sarissa firetruck
inftrike: { body: "Infestedtrike01", prop: "BaBaProp", weap: "BabaTrikeMG" }, // Infested Trike
infbuggy: { body: "Infestedsml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" }, // Infested Buggy
infrbuggy: { body: "InfestedRKbuggy01", prop: "BaBaProp", weap: "BabaRocket" }, // Infested Rocket Buggy
infbjeep: { body: "InfestedJeepBody", prop: "BaBaProp", weap: "InfJeepMG" }, // Infested Jeep
infrbjeep: { body: "InfestedRKJeepBody", prop: "BaBaProp", weap: "BabaRocket" }, // Infested Rocket Jeep
stinger: { body: "CrawlerBody", prop: "CyborgLegs", weap: "StingerTail" }, // Stinger Crawler
vilestinger: { body: "CrawlerBody", prop: "CyborgLegs", weap: "VileStingerTail" }, // Vile Stinger Crawler
boomtick: { body: "CrawlerBody", prop: "BoomTickLegs", weap: "BoomTickSac" }, // Boom Tick Crawler


// Reclamation 2 Campaign
// Player/Allied Units:
pllcanw: { body: "Body1REC", prop: "wheeled01", weap: "Cannon1Mk1" }, // Light Cannon Viper Wheels
pllmortw: { body: "Body1REC", prop: "wheeled01", weap: "Mortar1Mk1" }, // Mortar Viper Wheels
pllmraw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-MRL" }, // Mini-Rocket Array Viper Wheels
pllrepw: { body: "Body1REC", prop: "wheeled01", weap: "LightRepair1" }, // Repair Turret Viper Wheels
pllpodw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Viper Wheels
pllsarw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-LtA-TMk1" }, // Sarissa Viper Wheels
pllhmght: { body: "Body1REC", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Viper Half-tracks
pllcanht: { body: "Body1REC", prop: "HalfTrack", weap: "Cannon1Mk1" }, // Light Cannon Viper Half-tracks
pllcant: { body: "Body1REC", prop: "tracked01", weap: "Cannon1Mk1" }, // Light Cannon Viper Tracks
plltmgt: { body: "Body1REC", prop: "tracked01", weap: "MG2Mk1" }, // Twin Machinegun Viper Tracks
pllpodt: { body: "Body1REC", prop: "tracked01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Viper Tracks
pllsart: { body: "Body1REC", prop: "tracked01", weap: "Rocket-LtA-TMk1" }, // Sarissa Viper Tracks
pllmrat: { body: "Body1REC", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Viper Tracks
pllmortt: { body: "Body1REC", prop: "tracked01", weap: "Mortar1Mk1" }, // Mortar Viper Tracks
pllrept: { body: "Body1REC", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Viper Tracks
pllsenst: { body: "Body1REC", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Viper Tracks
plltruckt: { body: "Body1REC", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Viper Tracks
plmtruckht: { body: "Body5REC", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Cobra Tracks
plhhct: { body: "Body11ABT", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Python Tracks
plmatt: { body: "Body5REC", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Cobra Tracks
plmrept: { body: "Body5REC", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Cobra Tracks
plhasgnt: { body: "Body11ABT", prop: "tracked01", weap: "MG4ROTARYMk1" }, // Assault Gun Python Tracks
plhhpvt: { body: "Body11ABT", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Python Tracks
plhaacnt: { body: "Body11ABT", prop: "tracked01", weap: "AAGun2Mk1" }, // Whirlwind Python Tracks

pllcanv: { body: "Body1REC", prop: "V-Tol", weap: "Cannon1-VTOL" }, // Light Cannon Viper VTOL
pllpodv: { body: "Body1REC", prop: "V-Tol", weap: "Rocket-VTOL-Pod" }, // Mini-Rocket Pod Viper VTOL
pllhmgv: { body: "Body1REC", prop: "V-Tol", weap: "MG3-VTOL" }, // Heavy Machinegun Viper VTOL

// Cyborgs:
cybrp: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRepair" }, // Mechanic Cyborg
cyben: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgSpade" }, // Combat Engineer Cyborg
cybmg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgChaingun" }, // Machinegunner Cyborg
cybhmg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgHeavyChaingun" }, // Heavy Machinegunner Cyborg
cybag: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRotMG" }, // Assault Gunner Cyborg
cybfl: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgFlamer01" }, // Flamer Cyborg
cybth: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Thermite" }, // Thermite Flamer Cyborg
cybgr: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Grenade" }, // Grenadier Cyborg
cybla: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRocket" }, // Lancer Cyborg
scytk: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-TK" }, // Super Tank-Killer Cyborg
cybca: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannon" }, // Heavy Gunner Cyborg
scymc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Mcannon" }, // Super Heavy-Gunner Cyborg
scyhc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-HPV" }, // Super HPC Cyborg
scyac: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Acannon" }, // Super Auto-Cannon Cyborg
cybls: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Laser" }, // Flashlight Gunner Cyborg
nxcyrail: { body: "CybNXRail1Jmp", prop: "CyborgLegs02", weap: "NX-Cyb-Rail1" }, // NEXUS Needle Cyborg
nxcyscou: { body: "CybNXMissJmp", prop: "CyborgLegs02", weap: "NX-CyborgMiss" }, // NEXUS Scourge Cyborg
nxcylas: { body: "CybNXPulseLasJmp", prop: "CyborgLegs02", weap: "NX-CyborgPulseLas" }, // NEXUS Flashlight Cyborg

// Scavenger Units:
flatmrl: { body: "ScavTruckBody", prop: "BaBaProp", weap: ["RustRocket-Pod", "RustRocket-MRL"] }, // MRA Flatbed Truck
flatat: { body: "ScavTruckBody", prop: "BaBaProp", weap: ["RustRocket-Pod", "RustRocket-LtA-T"] }, // Lancer Flatbed Truck
gbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaMiniMortar" }, // Grenade Jeep
helpod: { body: "ScavengerHvyChopper", prop: "Helicopter", weap: "RustRocket-Pod-VTOL" }, // MRP Helicopter
monfire: { body: "MonsterFireBody", prop: "tracked01", weap: "RustFlame1Mk1" }, // Monster Fire Truck
crane: { body: "ScaveCraneBody", prop: "HalfTrack", weap: "ScavCrane" }, // Scavenger Crane (Truck)

// Infested Units:


// Collective Units:
colpodt: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Leopard Tracks
comatht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Panther Half-tracks
comatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Panther Tracks
comath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-LtA-T" }, // Lancer Panther Hover
comhatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-HvyA-T" }, // Tank Killer Panther Tracks

combbh: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Panther Hover
cohbbt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-BB" }, // Bunker Buster Tiger Tracks

colsensht: { body: "Body2SUP", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Leopard Half-tracks
colsenst: { body: "Body2SUP", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Leopard Tracks
comsensht: { body: "Body6SUPP", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Panther Half-tracks
comsenst: { body: "Body6SUPP", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Panther Tracks

coltruckht: { body: "Body2SUP", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Leopard Half-tracks
comtruckt: { body: "Body6SUPP", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Panther Tracks

colmortht: { body: "Body2SUP", prop: "HalfTrack", weap: "Mortar1Mk1" }, // Mortar Leopard Half-tracks
commortht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar1Mk1" }, // Mortar Panther Half-tracks
commortt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar1Mk1" }, // Mortar Panther Tracks
comhmortht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar2Mk1" }, // Bombard Panther Half-tracks
comhmortt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar2Mk1" }, // Bombard Panther Tracks
comrmortht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" }, // Pepperpot Panther Half-tracks
comrmortt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar3ROTARYMk1" }, // Pepperpot Panther Tracks
cohhowt: { body: "Body9REC", prop: "tracked01", weap: "Howitzer105Mk1" }, // Howitzer Tiger Tracks

colmrat: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Leopard Tracks
commrat: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Tracks
commrah: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Hover
// cohhrah: { body: "Body6SUPP", prop: "hover01", weap: "" }, // Heavy Rocket Array Tiger Hover
// cohhrat: { body: "Body6SUPP", prop: "tracked01", weap: "" }, // Heavy Rocket Array Tiger Tracks
cohript: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-IDF" }, // Ripple Rocket Tiger Tracks

colhmght: { body: "Body2SUP", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Leopard Half-tracks
colhmgt: { body: "Body2SUP", prop: "tracked01", weap: "MG3Mk1" }, // Heavy Machinegun Leopard Tracks
comhmgt: { body: "Body6SUPP", prop: "tracked01", weap: "MG3Mk1" }, // Heavy Machinegun Panther Tracks
comagt: { body: "Body6SUPP", prop: "tracked01", weap: "MG4ROTARYMk1" }, // Assault Gun Panther Tracks

colcanht: { body: "Body2SUP", prop: "HalfTrack", weap: "Cannon1Mk1" }, // Light Cannon Leopard Half-tracks
commcant: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Panther Tracks
comhpvt: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Panther Tracks
cohhcant: { body: "Body9REC", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Tiger Tracks
cohhpvt: { body: "Body9REC", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Tiger Tracks
cohacant: { body: "Body9REC", prop: "tracked01", weap: "Cannon5VulcanMk1" }, // Assault Cannon Tiger Tracks

colflamht: { body: "Body2SUP", prop: "HalfTrack", weap: "Flame1Mk1" }, // Flamer Leopard Half-tracks
colflamt: { body: "Body2SUP", prop: "tracked01", weap: "Flame1Mk1" }, // Flamer Leopard Tracks
cominft: { body: "Body6SUPP", prop: "tracked01", weap: "Flame2" }, // Inferno Panther Tracks
cominfh: { body: "Body6SUPP", prop: "hover01", weap: "Flame2" }, // Inferno Panther Hover

colrepht: { body: "Body2SUP", prop: "HalfTrack", weap: "LightRepair1" }, // Repair Turret Leopard Half-tracks
colrept: { body: "Body2SUP", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Leopard Tracks
comrept: { body: "Body6SUPP", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Panther Tracks

colaaht: { body: "Body2SUP", prop: "HalfTrack", weap: "QuadMg1AAGun" }, // Hurricane Leopard Half-tracks
comaaht: { body: "Body6SUPP", prop: "HalfTrack", weap: "QuadMg1AAGun" }, // Hurricane Panther Half-tracks
comaat: { body: "Body6SUPP", prop: "tracked01", weap: "QuadMg1AAGun" }, // Hurricane Panther Tracks
comhaaht: { body: "Body6SUPP", prop: "HalfTrack", weap: "AAGun2Mk1" }, // Cyclone Panther Half-tracks
comhaat: { body: "Body6SUPP", prop: "tracked01", weap: "AAGun2Mk1" }, // Cyclone Panther Tracks
cohraat: { body: "Body9REC", prop: "tracked01", weap: "QuadRotAAGun" }, // Whirlwind Tiger Tracks

comcomt: { body: "Body6SUPP", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Panther Tracks
cohcomt: { body: "Body9REC", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Tiger Tracks

colbombv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" }, // Cluster Bomb Leopard VTOL
colatv: { body: "Body2SUP", prop: "V-Tol", weap: "Rocket-VTOL-LtA-T" }, // Lancer Leopard VTOL
colhmgv: { body: "Body2SUP", prop: "V-Tol", weap: "MG3-VTOL" }, // Heavy Machinegun Leopard VTOL
colagv: { body: "Body2SUP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Leopard VTOL

comhbombv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Panther VTOL
comtbombv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb4-VTOL-HvyINC" }, // Thermite Bomb Panther VTOL
comhatv: { body: "Body6SUPP", prop: "V-Tol", weap: "Rocket-VTOL-HvyA-T" }, // Tank Killer Panther VTOL

// NEXUS Units
// CAM_3_A
nxtruckh: { body: "Body7ABT", prop: "hover02", weap: "Spade1Mk1" },
nxmserh: { body: "Body7ABT", prop: "hover02", weap: "Missile-MdArt" },
nxmreph: { body: "Body7ABT", prop: "hover02", weap: "LightRepair1" },
nxlsensh: { body: "Body3MBT", prop: "hover02", weap: "SensorTurret1Mk1" },
nxmrailh: { body: "Body7ABT", prop: "hover02", weap: "RailGun2Mk1" },
nxmscouh: { body: "Body7ABT", prop: "hover02", weap: "Missile-A-T" },

nxlneedv: { body: "Body3MBT", prop: "V-Tol02", weap: "RailGun1-VTOL" },
nxlscouv: { body: "Body3MBT", prop: "V-Tol02", weap: "Missile-VTOL-AT" },
nxmtherv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb4-VTOL-HvyINC" },


// CAM_3_1
nxmcommh: { body: "Body7ABT", prop: "hover02", weap: "CommandTurret1" },


// CAM_3_B
nxmlinkh: { body: "Body7ABT", prop: "hover02", weap: "NEXUSlink" },
nxmsamh: { body: "Body7ABT", prop: "hover02", weap: "Missile-HvySAM" },
nxmheapv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb2-VTOL-HvHE" },

// CAM_3_2
nxlflash: { body: "Body3MBT", prop: "hover02", weap: "Laser3BEAMMk1" },

// CAM_3_A_B
nxmsens: { body: "Body7ABT", prop: "hover02", weap: "SensorTurret1Mk1" },

// CAM_3_A_D_1
nxmpulseh: { body: "Body7ABT", prop: "hover02", weap: "Laser2PULSEMk1" },
nxlpulsev: { body: "Body3MBT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" },

// CAM_3_A_D_2
nxhgauss: { body: "Body10MBT", prop: "hover02", weap: "RailGun3Mk1" },
nxhrailv: { body: "Body10MBT", prop: "V-Tol02", weap: "RailGun2-VTOL" },

// CAM_3_4
nxllinkh: { body: "Body3MBT", prop: "hover02", weap: "NEXUSlink" },
nxmpulsev: { body: "Body7ABT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" },


////////////////////////////////////////////////////////////////////////////////

bubut: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-BB" },
sart: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-LtA-TMk1" },

};
