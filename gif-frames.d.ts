import {Initializer} from "multi-integer-range";
import {Canvas} from "canvas";
import stream from "stream";

declare module "gif-frames" {

    export default function gifFrames<T extends GifFrameOptions>(options: T): Promise<GifFrameData<T>[]>;
    export default function gifFrames<T extends GifFrameOptions>(options: T, callback: (err: Error, frameData: GifFrameData<T>[]) => void): void;

    type GifOutputType = "jpeg" | "jpg" | "gif" | "png" | "canvas";
    type GifFrameData<T extends GifFrameOptions> = T["outputType"] extends "canvas" ? GifFrameDataCanvas : GifFrameDataStream;

    interface GifFrameOptions {
        url: string | Buffer;
        frames: "all" | Initializer;
        outputType?: GifOutputType;
        quality?: number;
        cumulative?: boolean;
    }

    interface GifFrameDataCanvas {
        getImage(): Canvas;
        frameIndex: number;
        frameInfo: GifFrameInfo
    }

    interface GifFrameDataStream {
        getImage(): stream.Readable;
        frameIndex: number;
        frameInfo: GifFrameInfo
    }

    interface GifFrameInfo {
        x: number;
        y: number;
        width: number;
        height: number;
        has_local_palette: boolean;
        palette_offset: number;
        palette_size: number;
        data_offset: number;
        data_length: number;
        transparent_index: number;
        interlaced: boolean;
        delay: number;
        disposal: number;
    }
}