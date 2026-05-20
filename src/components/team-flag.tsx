const FIFA_TO_ISO: Record<string, string> = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz",
  CAN: "ca", SUI: "ch", QAT: "qa", BIH: "ba",
  BRA: "br", MAR: "ma", HTI: "ht", SCO: "gb-sct",
  USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec",
  NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
  ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  POR: "pt", COD: "cd", UZB: "uz", COL: "co",
  ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

type TeamFlagProps = {
  code: string;
  size?: number;
  className?: string;
};

export function TeamFlag({ code, size = 24, className }: TeamFlagProps) {
  const iso = FIFA_TO_ISO[code];
  if (!iso) {
    return (
      <span
        className={className}
        style={{ width: size, height: size, lineHeight: `${size}px`, fontSize: size * 0.5, textAlign: "center" }}
      >
        {code}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://hatscripts.github.io/circle-flags/flags/${iso}.svg`}
      alt={code}
      width={size}
      height={size}
      className={className}
      loading="lazy"
    />
  );
}
