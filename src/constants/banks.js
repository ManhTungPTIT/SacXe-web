const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

export const BANK_OPTIONS = [
  {
    code: "970415",
    name: "VietinBank",
    aliases: ["01201001", "VIETINBANK", "ICB"],
  },
  {
    code: "970436",
    name: "Vietcombank",
    aliases: ["01203001", "VIETCOMBANK", "VCB"],
  },
  { code: "970418", name: "BIDV", aliases: ["01202001", "BIDV"] },
  {
    code: "970405",
    name: "Agribank",
    aliases: ["01204001", "AGRIBANK", "VBA"],
  },
  { code: "970448", name: "OCB", aliases: ["79333001", "OCB"] },
  {
    code: "970422",
    name: "MBBank",
    aliases: ["01311001", "MBBANK", "MB", "MBBANK"],
  },
  {
    code: "970407",
    name: "Techcombank",
    aliases: ["01310001", "TECHCOMBANK", "TCB"],
  },
  { code: "970416", name: "ACB", aliases: ["79307001", "ACB"] },
  { code: "970432", name: "VPBank", aliases: ["01309001", "VPBANK", "VPB"] },
  { code: "970423", name: "TPBank", aliases: ["01358001", "TPBANK", "TPB"] },
  {
    code: "970403",
    name: "Sacombank",
    aliases: ["79303001", "SACOMBANK", "STB"],
  },
  { code: "970437", name: "HDBank", aliases: ["79321001", "HDBANK", "HDB"] },
  {
    code: "970454",
    name: "VietCapitalBank",
    aliases: ["79327001", "VIETCAPITALBANK", "VCCB", "VIET CAPITAL BANK"],
  },
  { code: "970429", name: "SCB", aliases: ["79334001", "SCB"] },
  { code: "970441", name: "VIB", aliases: ["79314013", "VIB"] },
  { code: "970443", name: "SHB", aliases: ["01348002", "SHB"] },
  {
    code: "970431",
    name: "Eximbank",
    aliases: ["79305001", "EXIMBANK", "EIB"],
  },
  { code: "970426", name: "MSB", aliases: ["01302001", "MSB"] },
  { code: "546034", name: "CAKE", aliases: ["CAKE"] },
  { code: "546035", name: "Ubank", aliases: ["UBANK"] },
  { code: "971005", name: "ViettelMoney", aliases: ["TLMONEY"] },
  { code: "963388", name: "Timo", aliases: ["TIMO"] },
  { code: "971011", name: "VNPTMoney", aliases: ["VNPTMONEY"] },
  {
    code: "970400",
    name: "SaigonBank",
    aliases: ["79308001", "SAIGONBANK", "SGICB"],
  },
  {
    code: "970409",
    name: "BacABank",
    aliases: ["40313001", "BACABANK", "BAB", "BAC A BANK"],
  },
  { code: "971025", name: "MoMo", aliases: ["MOMO"] },
  { code: "971133", name: "PVcomBank Pay", aliases: ["PVDB", "PVCOMBANKPAY"] },
  {
    code: "970412",
    name: "PVcomBank",
    aliases: ["01360002", "PVCOMBANK", "PVCB"],
  },
  { code: "970414", name: "MBV", aliases: ["01319001", "MBV"] },
  { code: "970419", name: "NCB", aliases: ["01352002", "NCB"] },
  {
    code: "970424",
    name: "ShinhanBank",
    aliases: ["79616001", "SHINHANBANK", "SHBVN", "SHINHAN BANK"],
  },
  { code: "970425", name: "ABBANK", aliases: ["01323002", "ABBANK", "ABB"] },
  {
    code: "970427",
    name: "VietABank",
    aliases: ["01355002", "VIETABANK", "VAB"],
  },
  {
    code: "970428",
    name: "NamABank",
    aliases: ["79306001", "NAMABANK", "NAB"],
  },
  { code: "970430", name: "PGBank", aliases: ["01341001", "PGBANK", "PGB"] },
  { code: "970433", name: "VietBank", aliases: ["79356001", "VIETBANK"] },
  {
    code: "970438",
    name: "BaoVietBank",
    aliases: ["01359001", "BAOVIETBANK", "BVB", "BAO VIET BANK"],
  },
  { code: "970440", name: "SeABank", aliases: ["01317001", "SEABANK", "SEAB"] },
  { code: "970446", name: "COOPBANK", aliases: ["01901001", "COOPBANK"] },
  { code: "970449", name: "LPBank", aliases: ["01357001", "LPBANK", "LPB"] },
  {
    code: "970452",
    name: "KienLongBank",
    aliases: ["91353001", "KIENLONGBANK", "KLB"],
  },
  { code: "668888", name: "KBank", aliases: ["KBANK", "KASIKORNBANK"] },
  { code: "977777", name: "MAFC", aliases: ["MAFC"] },
  {
    code: "970442",
    name: "HongLeong",
    aliases: ["79603001", "HONGLEONGBANK", "HLBVN", "HONG LEONG BANK"],
  },
  { code: "970467", name: "KEBHANAHN", aliases: ["KEBHN", "01626001"] },
  { code: "970466", name: "KEBHanaHCM", aliases: ["KEBHCM", "79656001"] },
  {
    code: "533948",
    name: "Citibank",
    aliases: ["CITIBANK", "01605001", "79654001"],
  },
  {
    code: "970444",
    name: "CBBank",
    aliases: ["01339001", "CBBANK", "VNCB", "CBB"],
  },
  { code: "422589", name: "CIMB", aliases: ["01661001", "CIMB"] },
  { code: "796500", name: "DBSBank", aliases: ["79650001", "DBSBANK", "DBS"] },
  { code: "970406", name: "Vikki", aliases: ["VIKKI"] },
  { code: "999888", name: "VBSP", aliases: ["01207001", "VBSP"] },
  { code: "970408", name: "GPBank", aliases: ["01320001", "GPBANK", "GPB"] },
  { code: "970463", name: "KookminHCM", aliases: ["KBHCM", "79631001"] },
  { code: "970462", name: "KookminHN", aliases: ["KBHN", "01666001"] },
  {
    code: "970457",
    name: "Woori",
    aliases: ["01663001", "WOORIBANK", "WVN", "WOORI BANK"],
  },
  { code: "970421", name: "VRB", aliases: ["01505001", "VRB"] },
  { code: "458761", name: "HSBC", aliases: ["79617001", "HSBC"] },
  { code: "970455", name: "IBKHN", aliases: ["IBK-HN", "01652001"] },
  { code: "970456", name: "IBKHCM", aliases: ["IBK-HCM", "79641001"] },
  {
    code: "970434",
    name: "IndovinaBank",
    aliases: ["79502001", "IVB", "INDOVINA"],
  },
  {
    code: "970458",
    name: "UnitedOverseas",
    aliases: ["79665001", "UOB", "UNITEDOVERSEAS"],
  },
  { code: "801011", name: "Nonghyup", aliases: ["01662001", "NHB", "NHBHN"] },
  {
    code: "970410",
    name: "StandardChartered",
    aliases: ["01604002", "STANDARDCHARTERED", "SCVN", "STANDARD CHARTERED"],
  },
  {
    code: "970439",
    name: "PublicBank",
    aliases: ["01501001", "PUBLICBANK", "PBVN", "PUBLIC BANK"],
  },
];

const matchesCode = (bankOption, normalizedCode) => {
  if (normalize(bankOption.code) === normalizedCode) return true;
  if (!Array.isArray(bankOption.aliases)) return false;
  return bankOption.aliases.some(
    (alias) => normalize(alias) === normalizedCode,
  );
};

export const findBankByCode = (bankCode) => {
  const normalizedCode = normalize(bankCode);
  if (!normalizedCode) return null;
  return (
    BANK_OPTIONS.find((bankOption) =>
      matchesCode(bankOption, normalizedCode),
    ) || null
  );
};

export const findBankByName = (bankName) => {
  const normalizedName = normalize(bankName);
  if (!normalizedName) return null;
  return (
    BANK_OPTIONS.find(
      (bankOption) =>
        normalize(bankOption.name) === normalizedName ||
        (Array.isArray(bankOption.aliases) &&
          bankOption.aliases.some(
            (alias) => normalize(alias) === normalizedName,
          )),
    ) || null
  );
};
