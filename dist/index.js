import FileList from "./FilelistApi.js";
import { dirname } from "desm";
import { join } from "path";
import { readFile } from "fs/promises";
import { parse as bytesParse } from "bytes";
import { parse as torrentParse } from "parse-torrent-title";
const _dirname = dirname(import.meta.url);
const pkgJson = join(_dirname, "../package.json");
const versionLoaded = JSON.parse(await readFile(join(_dirname, "../package.json"), { encoding: "utf-8" }))?.version;
class FilelistProvider {
    api;
    log;
    async getTorrentFor(movie) {
        return {
            file: await this.api.download(movie._props.downloadUrl)
        };
    }
    async init(config, log) {
        const cookieFile = join(_dirname, "../cookie.json");
        this.api = new FileList({ ...config, log, cookieFile });
        this.log = log;
        await this.api.login();
        this.log.info(`Initialized and logged in v${versionLoaded}`);
    }
    async searchMovie(movie) {
        const searchRes = await this.api.search(movie.imdbId.toString());
        return searchRes.torrents.map(tor => ({
            id: tor.id,
            torrentName: tor.title,
            size: bytesParse(tor.size),
            peers: tor.seeds,
            info: torrentParse(tor.title),
            _props: {
                downloadUrl: tor.url,
            }
        }));
    }
    async clearData() {
        return this.api?.clearCookies();
    }
}
export default FilelistProvider;
export const info = {
    name: "Filelist.io",
    description: "Torrent provider from filelist.io. Requires invitation only account",
    version: versionLoaded,
    configInfo: {
        username: {
            type: "string",
            friendlyName: "Filelist Username",
            description: "The username you use on filelist.io",
            required: true
        },
        password: {
            type: "password",
            friendlyName: "Filelist Password",
            description: "The password you use on filelist.io",
            required: true,
        },
        base_url: {
            type: "string",
            friendlyName: "Filelist Base URL",
            description: "The base url for filelist, default: 'https://filelist.io'",
            default: "https://filelist.io"
        }
    }
};
//# sourceMappingURL=index.js.map