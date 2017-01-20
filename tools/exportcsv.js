'use strict';

const fs = require('fs');
const csv = require('fast-csv');
const async = require('async');
const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');
const path = require('path');

let mongo = null;
let symbols = null;
let tbImported = null;
let outputFolder = process.argv[2];

if (!outputFolder) {
    console.log('Usage: node exportcsv <outputFolder>');
    process.exit();
}

let collections = [
    "A",
    "AAV",
    "ABC",
    "ABPIF",
    "ACC",
    "ADVANC",
    "AEC",
    "AEONTS",
    "AFC",
    "AH",
    "AHC",
    "AIT",
    "AJ",
    "AJD",
    "AKR",
    "ALLA",
    "ALT",
    "ALUCON",
    "AMANAH",
    "AMARIN",
    "AMATA",
    "AMATAR",
    "AMATAV",
    "AMC",
    "ANAN",
    "AOT",
    "AP",
    "APCS",
    "APURE",
    "AQ",
    "AQUA",
    "AS",
    "ASEFA",
    "ASIA",
    "ASIAN",
    "ASIMAR",
    "ASK",
    "ASP",
    "AYUD",
    "BA",
    "BAFS",
    "BANPU",
    "BAT-3K",
    "BAY",
    "BBL",
    "BCH",
    "BCP",
    "BCPG",
    "BDMS",
    "BEAUTY",
    "BEC",
    "BEM",
    "BFIT",
    "BH",
    "BIG",
    "BIGC",
    "BJC",
    "BJCHI",
    "BKI",
    "BKKCP",
    "BLA",
    "BLAND",
    "BPP",
    "BR",
    "BROCK",
    "BRR",
    "BSBM",
    "BTC",
    "BTNC",
    "BTS",
    "BTSGIF",
    "BWG",
    "CBG",
    "CCET",
    "CCP",
    "CEN",
    "CENTEL",
    "CFRESH",
    "CGD",
    "CGH",
    "CHARAN",
    "CHG",
    "CHOTI",
    "CI",
    "CIMBT",
    "CITY",
    "CK",
    "CKP",
    "CM",
    "CMR",
    "CNS",
    "CNT",
    "COL",
    "COM",
    "COM7",
    "CPALL",
    "CPF",
    "CPH",
    "CPI",
    "CPL",
    "CPN",
    "CPNCG",
    "CPNRF",
    "CPTGF",
    "CRANE",
    "CRYSTAL",
    "CSC",
    "CSL",
    "CSP",
    "CSR",
    "CSS",
    "CTARAF",
    "CTW",
    "CWT",
    "DCC",
    "DCON",
    "DELTA",
    "DEMCO",
    "DIF",
    "DRACO",
    "DRT",
    "DSGT",
    "DTAC",
    "DTC",
    "DTCI",
    "DTCPF",
    "EA",
    "EARTH",
    "EASON",
    "EASTW",
    "ECL",
    "EE",
    "EGATIF",
    "EGCO",
    "EIC",
    "EKH",
    "EMC",
    "EPCO",
    "EPG",
    "ERW",
    "ERWPF",
    "ESSO",
    "ESTAR",
    "EVER",
    "FANCY",
    "FE",
    "FER",
    "FMT",
    "FN",
    "FND",
    "FNS",
    "FORTH",
    "FSS",
    "FUTUREPF",
    "GBX",
    "GC",
    "GEL",
    "GENCO",
    "GFPT",
    "GIFT",
    "GJS",
    "GL",
    "GLAND",
    "GLOBAL",
    "GLOW",
    "GOLD",
    "GOLDPF",
    "GPSC",
    "GRAMMY",
    "GRAND",
    "GREEN",
    "GSTEL",
    "GUNKUL",
    "GVREIT",
    "GYT",
    "HANA",
    "HFT",
    "HMPRO",
    "HPF",
    "HREIT",
    "HTC",
    "ICC",
    "ICHI",
    "IEC",
    "IFEC",
    "IFS",
    "IHL",
    "ILINK",
    "IMPACT",
    "INET",
    "INOX",
    "INSURE",
    "INTUCH",
    "IRC",
    "IRPC",
    "IT",
    "ITD",
    "IVL",
    "J",
    "JAS",
    "JASIF",
    "JCT",
    "JMART",
    "JMT",
    "JTS",
    "JUTHA",
    "JWD",
    "KAMART",
    "KBANK",
    "KBS",
    "KC",
    "KCAR",
    "KCE",
    "KDH",
    "KGI",
    "KKC",
    "KKP",
    "KPNPF",
    "KSL",
    "KTB",
    "KTC",
    "KTIS",
    "KWC",
    "KWG",
    "KYE",
    "LALIN",
    "LANNA",
    "LEE",
    "LH",
    "LHBANK",
    "LHHOTEL",
    "LHK",
    "LHPF",
    "LHSC",
    "LNE",
    "LOXLEY",
    "LPH",
    "LPN",
    "LRH",
    "LST",
    "LTX",
    "LUXF",
    "M",
    "M-CHAI",
    "M-II",
    "M-PAT",
    "M-STOR",
    "MACO",
    "MAJOR",
    "MAKRO",
    "MALEE",
    "MANRIN",
    "MATCH",
    "MATI",
    "MAX",
    "MBK",
    "MBKET",
    "MC",
    "MCOT",
    "MCS",
    "MDX",
    "MEGA",
    "METCO",
    "MFC",
    "MFEC",
    "MIDA",
    "MILL",
    "MINT",
    "MIPF",
    "MIT",
    "MJD",
    "MJLF",
    "MK",
    "ML",
    "MNIT",
    "MNIT2",
    "MNRF",
    "MODERN",
    "MONO",
    "MONTRI",
    "MPIC",
    "MSC",
    "MTI",
    "MTLS",
    "NC",
    "NCH",
    "NEP",
    "NEW",
    "NKI",
    "NMG",
    "NNCL",
    "NOBLE",
    "NOK",
    "NPP",
    "NSI",
    "NTV",
    "NUSA",
    "NWR",
    "NYT",
    "OCC",
    "OGC",
    "OHTL",
    "OISHI",
    "ORI",
    "PACE",
    "PAE",
    "PAF",
    "PAP",
    "PATO",
    "PB",
    "PCSGH",
    "PDI",
    "PE",
    "PERM",
    "PF",
    "PG",
    "PK",
    "PL",
    "PLANB",
    "PLAT",
    "PLE",
    "PM",
    "PMTA",
    "POLAR",
    "POPF",
    "POST",
    "PPF",
    "PPP",
    "PR",
    "PRAKIT",
    "PRANDA",
    "PREB",
    "PRECHA",
    "PRG",
    "PRIN",
    "PRINC",
    "PS",
    "PSH",
    "PSL",
    "PT",
    "PTG",
    "PTL",
    "PTT",
    "PTTEP",
    "PTTGC",
    "PYLON",
    "Q-CON",
    "QH",
    "QHHR",
    "QHOP",
    "QHPF",
    "RAM",
    "RATCH",
    "RCI",
    "RCL",
    "RICH",
    "RICHY",
    "RJH",
    "RML",
    "ROBINS",
    "ROCK",
    "ROH",
    "ROJNA",
    "RPC",
    "RS",
    "S",
    "S N J",
    "S11",
    "SABINA",
    "SAM",
    "SAMART",
    "SAMCO",
    "SAMTEL",
    "SAPPE",
    "SAT",
    "SAUCE",
    "SAWAD",
    "SAWANG",
    "SBPF",
    "SC",
    "SCB",
    "SCC",
    "SCCC",
    "SCG",
    "SCI",
    "SCN",
    "SCP",
    "SE-ED",
    "SEAFCO",
    "SENA",
    "SF",
    "SFP",
    "SGP",
    "SHANG",
    "SIAM",
    "SIM",
    "SINGER",
    "SIRI",
    "SIRIP",
    "SIS",
    "SITHAI",
    "SKR",
    "SLP",
    "SMIT",
    "SMK",
    "SMM",
    "SMPC",
    "SMT",
    "SNC",
    "SNJ",
    "SNP",
    "SOLAR",
    "SORKON",
    "SPACK",
    "SPALI",
    "SPC",
    "SPCG",
    "SPF",
    "SPG",
    "SPI",
    "SPORT",
    "SPPT",
    "SPRC",
    "SPWPF",
    "SQ",
    "SRICHA",
    "SRIPANWA",
    "SSC",
    "SSF",
    "SSI",
    "SSPF",
    "SSSC",
    "SST",
    "SSTPF",
    "SSTSS",
    "STA",
    "STANLY",
    "STEC",
    "STPI",
    "SUC",
    "SUPER",
    "SUSCO",
    "SUTHA",
    "SVH",
    "SVI",
    "SVOA",
    "SYMC",
    "SYNEX",
    "SYNTEC",
    "TAE",
    "TASCO",
    "TBSP",
    "TC",
    "TCAP",
    "TCB",
    "TCC",
    "TCCC",
    "TCIF",
    "TCJ",
    "TCMC",
    "TCOAT",
    "TEAM",
    "TF",
    "TFD",
    "TFG",
    "TFI",
    "TFUND",
    "TGCI",
    "TGPRO",
    "TGROWTH",
    "TH",
    "THAI",
    "THANI",
    "THCOM",
    "THE",
    "THIF",
    "THIP",
    "THRE",
    "THREL",
    "TIC",
    "TICON",
    "TIF1",
    "TIP",
    "TIPCO",
    "TISCO",
    "TIW",
    "TK",
    "TKN",
    "TKS",
    "TKT",
    "TLGF",
    "TLHPF",
    "TLOGIS",
    "TLUXE",
    "TMB",
    "TMD",
    "TMT",
    "TNITY",
    "TNL",
    "TNPC",
    "TNPF",
    "TNR",
    "TOG",
    "TOP",
    "TOPP",
    "TPA",
    "TPBI",
    "TPC",
    "TPCORP",
    "TPIPL",
    "TPOLY",
    "TPP",
    "TPRIME",
    "TR",
    "TRC",
    "TREIT",
    "TRIF",
    "TRITN",
    "TRU",
    "TRUBB",
    "TRUE",
    "TSC",
    "TSI",
    "TSR",
    "TSTE",
    "TSTH",
    "TTA",
    "TTCL",
    "TTI",
    "TTL",
    "TTLPF",
    "TTNT",
    "TTTM",
    "TTW",
    "TU",
    "TU-PF",
    "TVI",
    "TVO",
    "TWP",
    "TWPC",
    "TWZ",
    "TYCN",
    "U",
    "UMI",
    "UNIPF",
    "UNIQ",
    "UOBKH",
    "UP",
    "UPF",
    "UPOIC",
    "URBNPF",
    "UT",
    "UTP",
    "UV",
    "UVAN",
    "VARO",
    "VGI",
    "VIBHA",
    "VIH",
    "VNG",
    "VNT",
    "VPO",
    "WACOAL",
    "WAVE",
    "WG",
    "WHA",
    "WHABT",
    "WHAPF",
    "WHART",
    "WICE",
    "WIIK",
    "WIN",
    "WORK",
    "ZMICO"
];

MongoClient.connect('mongodb://localhost/ginne', (err, db) => {
    if (err) {
        reject(err);
    } else {
        console.log('MongoDB database connection established');

        async.eachSeries(collections,
            function (col, callback) {
                let collection = db.collection(col);
                let promise = collection.find().toArray();
                promise
                    .then(function (list) {
                        let outputFile = path.join(outputFolder, col + '.csv');
                        console.log('writing ' + outputFile);                        
                        let outputContent = [];
                        for (let i=0; i<list.length; i++) {
                            outputContent.push([
                                '"' + col+ '"',
                                moment(list[i].d).format('YYYY-MM-DD'),
                                list[i].o,
                                list[i].h,
                                list[i].l,
                                list[i].c,
                                list[i].v
                            ].join(','));
                        }
                        fs.writeFileSync(outputFile, outputContent.join('\n'));
                        callback();
                    })
                    .catch(function (err) {
                        callback(err);
                    });
            },
            function (err) {
                if (!err) {
                    console.log('Done!');
                } else{
                    console.log(err);
                }
            }
        );
    }
});