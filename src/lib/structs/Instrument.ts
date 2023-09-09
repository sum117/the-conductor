type InstrumentType = {
  id: number;
  name?: string;
  description?: string;
  type?: string;
};

export class Instrument {
  public id = "";
  public name = "";
  public description = "";
  public type = "";
  public characterId = "";

  public static isInstrument = (instrument: unknown): instrument is InstrumentType =>
    typeof instrument === "object" &&
    instrument !== null &&
    "id" in instrument &&
    "characterId" in instrument &&
    "type" in instrument;

  constructor(instrument?: InstrumentType) {
    Object.assign(this, instrument);
  }
}
