import path from "path";
import {SatoriOptions} from "satori";

export async function getSatoriOptions() {
  const interArrayBuffer = await Bun.file(path.join(import.meta.dir, "../../fonts/Inter-Regular.ttf")).arrayBuffer();

  const options: SatoriOptions = {
    width: 420,
    height: 475,
    fonts: [
      {
        name: "Roboto",
        data: interArrayBuffer,
        weight: 400,
        style: "normal",
      },
    ],
  };
  return options;
}
