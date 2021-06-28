
// inspired by 
// - https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
// - https://arkenfox.github.io/TZP
const mimeTypes = ['application/mp21', 'application/mp4', 'application/octet-stream', 'application/ogg', 'application/vnd.apple.mpegurl', 'application/vnd.ms-ss', 'application/vnd.ms-sstr+xml', 'application/x-mpegurl', 'application/x-mpegURL; codecs="avc1.42E01E"', 'audio/3gpp', 'audio/3gpp2', 'audio/aac', 'audio/ac-3', 'audio/ac3', 'audio/aiff', 'audio/basic', 'audio/ec-3', 'audio/flac', 'audio/m4a', 'audio/mid', 'audio/midi', 'audio/mp3', 'audio/mp4', 'audio/mp4; codecs="a3ds"', 'audio/mp4; codecs="A52"', 'audio/mp4; codecs="aac"', 'audio/mp4; codecs="ac-3"', 'audio/mp4; codecs="ac-4"', 'audio/mp4; codecs="ac3"', 'audio/mp4; codecs="alac"', 'audio/mp4; codecs="alaw"', 'audio/mp4; codecs="bogus"', 'audio/mp4; codecs="dra1"', 'audio/mp4; codecs="dts-"', 'audio/mp4; codecs="dts+"', 'audio/mp4; codecs="dtsc"', 'audio/mp4; codecs="dtse"', 'audio/mp4; codecs="dtsh"', 'audio/mp4; codecs="dtsl"', 'audio/mp4; codecs="dtsx"', 'audio/mp4; codecs="ec-3"', 'audio/mp4; codecs="enca"', 'audio/mp4; codecs="flac"', 'audio/mp4; codecs="g719"', 'audio/mp4; codecs="g726"', 'audio/mp4; codecs="m4ae"', 'audio/mp4; codecs="mha1"', 'audio/mp4; codecs="mha2"', 'audio/mp4; codecs="mhm1"', 'audio/mp4; codecs="mhm2"', 'audio/mp4; codecs="mlpa"', 'audio/mp4; codecs="mp3"', 'audio/mp4; codecs="mp4a.40.1"', 'audio/mp4; codecs="mp4a.40.12"', 'audio/mp4; codecs="mp4a.40.13"', 'audio/mp4; codecs="mp4a.40.14"', 'audio/mp4; codecs="mp4a.40.15"', 'audio/mp4; codecs="mp4a.40.16"', 'audio/mp4; codecs="mp4a.40.17"', 'audio/mp4; codecs="mp4a.40.19"', 'audio/mp4; codecs="mp4a.40.2"', 'audio/mp4; codecs="mp4a.40.20"', 'audio/mp4; codecs="mp4a.40.21"', 'audio/mp4; codecs="mp4a.40.22"', 'audio/mp4; codecs="mp4a.40.23"', 'audio/mp4; codecs="mp4a.40.24"', 'audio/mp4; codecs="mp4a.40.25"', 'audio/mp4; codecs="mp4a.40.26"', 'audio/mp4; codecs="mp4a.40.27"', 'audio/mp4; codecs="mp4a.40.28"', 'audio/mp4; codecs="mp4a.40.29"', 'audio/mp4; codecs="mp4a.40.3"', 'audio/mp4; codecs="mp4a.40.32"', 'audio/mp4; codecs="mp4a.40.33"', 'audio/mp4; codecs="mp4a.40.34"', 'audio/mp4; codecs="mp4a.40.35"', 'audio/mp4; codecs="mp4a.40.36"', 'audio/mp4; codecs="mp4a.40.4"', 'audio/mp4; codecs="mp4a.40.5"', 'audio/mp4; codecs="mp4a.40.6"', 'audio/mp4; codecs="mp4a.40.7"', 'audio/mp4; codecs="mp4a.40.8"', 'audio/mp4; codecs="mp4a.40.9"', 'audio/mp4; codecs="mp4a.40"', 'audio/mp4; codecs="mp4a.66"', 'audio/mp4; codecs="mp4a.67"', 'audio/mp4; codecs="mp4a.68"', 'audio/mp4; codecs="mp4a.69"', 'audio/mp4; codecs="mp4a.6B"', 'audio/mp4; codecs="mp4a"', 'audio/mp4; codecs="Opus"', 'audio/mp4; codecs="raw "', 'audio/mp4; codecs="samr"', 'audio/mp4; codecs="sawb"', 'audio/mp4; codecs="sawp"', 'audio/mp4; codecs="sevc"', 'audio/mp4; codecs="sqcp"', 'audio/mp4; codecs="ssmv"', 'audio/mp4; codecs="twos"', 'audio/mp4; codecs="ulaw"', 'audio/mpeg', 'audio/mpeg; codecs="mp3"', 'audio/mpegurl', 'audio/ogg; codecs="flac"', 'audio/ogg; codecs="opus"', 'audio/ogg; codecs="speex"', 'audio/ogg; codecs="vorbis"', 'audio/vnd.rn-realaudio', 'audio/vnd.wave', 'audio/wav', 'audio/wav; codecs="0"', 'audio/wav; codecs="1"', 'audio/wav; codecs="2"', 'audio/wave', 'audio/wave; codecs="0"', 'audio/wave; codecs="1"', 'audio/wave; codecs="2"', 'audio/webm', 'audio/webm; codecs="opus"', 'audio/webm; codecs="vorbis"', 'audio/wma', 'audio/x-aac', 'audio/x-ac3', 'audio/x-aiff', 'audio/x-flac', 'audio/x-m4a', 'audio/x-midi', 'audio/x-mpeg', 'audio/x-mpegurl', 'audio/x-pn-realaudio', 'audio/x-pn-realaudio-plugin', 'audio/x-pn-wav', 'audio/x-pn-wav; codecs="0"', 'audio/x-pn-wav; codecs="1"', 'audio/x-pn-wav; codecs="2"', 'audio/x-scpls', 'audio/x-wav', 'audio/x-wav; codecs="0"', 'audio/x-wav; codecs="1"', 'audio/x-wav; codecs="2"', 'video/3gpp', 'video/3gpp; codecs="mp4v.20.8, samr"', 'video/3gpp2', 'video/avi', 'video/h263', 'video/mp2t', 'video/mp4', 'video/mp4; codecs="3gvo"', 'video/mp4; codecs="a3d1"', 'video/mp4; codecs="a3d2"', 'video/mp4; codecs="a3d3"', 'video/mp4; codecs="a3d4"', 'video/mp4; codecs="av01.0.08M.08"', 'video/mp4; codecs="avc1.2c000a"', 'video/mp4; codecs="avc1.2c000b"', 'video/mp4; codecs="avc1.2c000c"', 'video/mp4; codecs="avc1.2c000d"', 'video/mp4; codecs="avc1.2c0014"', 'video/mp4; codecs="avc1.2c0015"', 'video/mp4; codecs="avc1.2c0016"', 'video/mp4; codecs="avc1.2c001e"', 'video/mp4; codecs="avc1.2c001f"', 'video/mp4; codecs="avc1.2c0020"', 'video/mp4; codecs="avc1.2c0028"', 'video/mp4; codecs="avc1.2c0029"', 'video/mp4; codecs="avc1.2c002a"', 'video/mp4; codecs="avc1.2c0032"', 'video/mp4; codecs="avc1.2c0033"', 'video/mp4; codecs="avc1.2c0034"', 'video/mp4; codecs="avc1.2c003c"', 'video/mp4; codecs="avc1.2c003d"', 'video/mp4; codecs="avc1.2c003e"', 'video/mp4; codecs="avc1.2c003f"', 'video/mp4; codecs="avc1.2c0040"', 'video/mp4; codecs="avc1.2c0050"', 'video/mp4; codecs="avc1.2c006e"', 'video/mp4; codecs="avc1.2c0085"', 'video/mp4; codecs="avc1.42000a"', 'video/mp4; codecs="avc1.42000b"', 'video/mp4; codecs="avc1.42000c"', 'video/mp4; codecs="avc1.42000d"', 'video/mp4; codecs="avc1.420014"', 'video/mp4; codecs="avc1.420015"', 'video/mp4; codecs="avc1.420016"', 'video/mp4; codecs="avc1.42001e"', 'video/mp4; codecs="avc1.42001f"', 'video/mp4; codecs="avc1.420020"', 'video/mp4; codecs="avc1.420028"', 'video/mp4; codecs="avc1.420029"', 'video/mp4; codecs="avc1.42002a"', 'video/mp4; codecs="avc1.420032"', 'video/mp4; codecs="avc1.420033"', 'video/mp4; codecs="avc1.420034"', 'video/mp4; codecs="avc1.42003c"', 'video/mp4; codecs="avc1.42003d"', 'video/mp4; codecs="avc1.42003e"', 'video/mp4; codecs="avc1.42003f"', 'video/mp4; codecs="avc1.420040"', 'video/mp4; codecs="avc1.420050"', 'video/mp4; codecs="avc1.42006e"', 'video/mp4; codecs="avc1.420085"', 'video/mp4; codecs="avc1.42400a"', 'video/mp4; codecs="avc1.42400b"', 'video/mp4; codecs="avc1.42400c"', 'video/mp4; codecs="avc1.42400d"', 'video/mp4; codecs="avc1.424014"', 'video/mp4; codecs="avc1.424015"', 'video/mp4; codecs="avc1.424016"', 'video/mp4; codecs="avc1.42401e"', 'video/mp4; codecs="avc1.42401f"', 'video/mp4; codecs="avc1.424020"', 'video/mp4; codecs="avc1.424028"', 'video/mp4; codecs="avc1.424029"', 'video/mp4; codecs="avc1.42402a"', 'video/mp4; codecs="avc1.424032"', 'video/mp4; codecs="avc1.424033"', 'video/mp4; codecs="avc1.424034"', 'video/mp4; codecs="avc1.42403c"', 'video/mp4; codecs="avc1.42403d"', 'video/mp4; codecs="avc1.42403e"', 'video/mp4; codecs="avc1.42403f"', 'video/mp4; codecs="avc1.424040"', 'video/mp4; codecs="avc1.424050"', 'video/mp4; codecs="avc1.42406e"', 'video/mp4; codecs="avc1.424085"', 'video/mp4; codecs="avc1.4d000a"', 'video/mp4; codecs="avc1.4d000b"', 'video/mp4; codecs="avc1.4d000c"', 'video/mp4; codecs="avc1.4d000d"', 'video/mp4; codecs="avc1.4d0014"', 'video/mp4; codecs="avc1.4d0015"', 'video/mp4; codecs="avc1.4d0016"', 'video/mp4; codecs="avc1.4d001e"', 'video/mp4; codecs="avc1.4d001f"', 'video/mp4; codecs="avc1.4d0020"', 'video/mp4; codecs="avc1.4d0028"', 'video/mp4; codecs="avc1.4d0029"', 'video/mp4; codecs="avc1.4d002a"', 'video/mp4; codecs="avc1.4d0032"', 'video/mp4; codecs="avc1.4d0033"', 'video/mp4; codecs="avc1.4d0034"', 'video/mp4; codecs="avc1.4d003c"', 'video/mp4; codecs="avc1.4d003d"', 'video/mp4; codecs="avc1.4d003e"', 'video/mp4; codecs="avc1.4d003f"', 'video/mp4; codecs="avc1.4d0040"', 'video/mp4; codecs="avc1.4d0050"', 'video/mp4; codecs="avc1.4d006e"', 'video/mp4; codecs="avc1.4d0085"', 'video/mp4; codecs="avc1.4d400a"', 'video/mp4; codecs="avc1.4d400b"', 'video/mp4; codecs="avc1.4d400c"', 'video/mp4; codecs="avc1.4d400d"', 'video/mp4; codecs="avc1.4d4014"', 'video/mp4; codecs="avc1.4d4015"', 'video/mp4; codecs="avc1.4d4016"', 'video/mp4; codecs="avc1.4d401e"', 'video/mp4; codecs="avc1.4d401f"', 'video/mp4; codecs="avc1.4d4020"', 'video/mp4; codecs="avc1.4d4028"', 'video/mp4; codecs="avc1.4d4029"', 'video/mp4; codecs="avc1.4d402a"', 'video/mp4; codecs="avc1.4d4032"', 'video/mp4; codecs="avc1.4d4033"', 'video/mp4; codecs="avc1.4d4034"', 'video/mp4; codecs="avc1.4d403c"', 'video/mp4; codecs="avc1.4d403d"', 'video/mp4; codecs="avc1.4d403e"', 'video/mp4; codecs="avc1.4d403f"', 'video/mp4; codecs="avc1.4d4040"', 'video/mp4; codecs="avc1.4d4050"', 'video/mp4; codecs="avc1.4d406e"', 'video/mp4; codecs="avc1.4d4085"', 'video/mp4; codecs="avc1.53000a"', 'video/mp4; codecs="avc1.53000b"', 'video/mp4; codecs="avc1.53000c"', 'video/mp4; codecs="avc1.53000d"', 'video/mp4; codecs="avc1.530014"', 'video/mp4; codecs="avc1.530015"', 'video/mp4; codecs="avc1.530016"', 'video/mp4; codecs="avc1.53001e"', 'video/mp4; codecs="avc1.53001f"', 'video/mp4; codecs="avc1.530020"', 'video/mp4; codecs="avc1.530028"', 'video/mp4; codecs="avc1.530029"', 'video/mp4; codecs="avc1.53002a"', 'video/mp4; codecs="avc1.530032"', 'video/mp4; codecs="avc1.530033"', 'video/mp4; codecs="avc1.530034"', 'video/mp4; codecs="avc1.53003c"', 'video/mp4; codecs="avc1.53003d"', 'video/mp4; codecs="avc1.53003e"', 'video/mp4; codecs="avc1.53003f"', 'video/mp4; codecs="avc1.530040"', 'video/mp4; codecs="avc1.530050"', 'video/mp4; codecs="avc1.53006e"', 'video/mp4; codecs="avc1.530085"', 'video/mp4; codecs="avc1.53040a"', 'video/mp4; codecs="avc1.53040b"', 'video/mp4; codecs="avc1.53040c"', 'video/mp4; codecs="avc1.53040d"', 'video/mp4; codecs="avc1.530414"', 'video/mp4; codecs="avc1.530415"', 'video/mp4; codecs="avc1.530416"', 'video/mp4; codecs="avc1.53041e"', 'video/mp4; codecs="avc1.53041f"', 'video/mp4; codecs="avc1.530420"', 'video/mp4; codecs="avc1.530428"', 'video/mp4; codecs="avc1.530429"', 'video/mp4; codecs="avc1.53042a"', 'video/mp4; codecs="avc1.530432"', 'video/mp4; codecs="avc1.530433"', 'video/mp4; codecs="avc1.530434"', 'video/mp4; codecs="avc1.53043c"', 'video/mp4; codecs="avc1.53043d"', 'video/mp4; codecs="avc1.53043e"', 'video/mp4; codecs="avc1.53043f"', 'video/mp4; codecs="avc1.530440"', 'video/mp4; codecs="avc1.530450"', 'video/mp4; codecs="avc1.53046e"', 'video/mp4; codecs="avc1.530485"', 'video/mp4; codecs="avc1.56000a"', 'video/mp4; codecs="avc1.56000b"', 'video/mp4; codecs="avc1.56000c"', 'video/mp4; codecs="avc1.56000d"', 'video/mp4; codecs="avc1.560014"', 'video/mp4; codecs="avc1.560015"', 'video/mp4; codecs="avc1.560016"', 'video/mp4; codecs="avc1.56001e"', 'video/mp4; codecs="avc1.56001f"', 'video/mp4; codecs="avc1.560020"', 'video/mp4; codecs="avc1.560028"', 'video/mp4; codecs="avc1.560029"', 'video/mp4; codecs="avc1.56002a"', 'video/mp4; codecs="avc1.560032"', 'video/mp4; codecs="avc1.560033"', 'video/mp4; codecs="avc1.560034"', 'video/mp4; codecs="avc1.56003c"', 'video/mp4; codecs="avc1.56003d"', 'video/mp4; codecs="avc1.56003e"', 'video/mp4; codecs="avc1.56003f"', 'video/mp4; codecs="avc1.560040"', 'video/mp4; codecs="avc1.560050"', 'video/mp4; codecs="avc1.56006e"', 'video/mp4; codecs="avc1.560085"', 'video/mp4; codecs="avc1.56040a"', 'video/mp4; codecs="avc1.56040b"', 'video/mp4; codecs="avc1.56040c"', 'video/mp4; codecs="avc1.56040d"', 'video/mp4; codecs="avc1.560414"', 'video/mp4; codecs="avc1.560415"', 'video/mp4; codecs="avc1.560416"', 'video/mp4; codecs="avc1.56041e"', 'video/mp4; codecs="avc1.56041f"', 'video/mp4; codecs="avc1.560420"', 'video/mp4; codecs="avc1.560428"', 'video/mp4; codecs="avc1.560429"', 'video/mp4; codecs="avc1.56042a"', 'video/mp4; codecs="avc1.560432"', 'video/mp4; codecs="avc1.560433"', 'video/mp4; codecs="avc1.560434"', 'video/mp4; codecs="avc1.56043c"', 'video/mp4; codecs="avc1.56043d"', 'video/mp4; codecs="avc1.56043e"', 'video/mp4; codecs="avc1.56043f"', 'video/mp4; codecs="avc1.560440"', 'video/mp4; codecs="avc1.560450"', 'video/mp4; codecs="avc1.56046e"', 'video/mp4; codecs="avc1.560485"', 'video/mp4; codecs="avc1.56100a"', 'video/mp4; codecs="avc1.56100b"', 'video/mp4; codecs="avc1.56100c"', 'video/mp4; codecs="avc1.56100d"', 'video/mp4; codecs="avc1.561014"', 'video/mp4; codecs="avc1.561015"', 'video/mp4; codecs="avc1.561016"', 'video/mp4; codecs="avc1.56101e"', 'video/mp4; codecs="avc1.56101f"', 'video/mp4; codecs="avc1.561020"', 'video/mp4; codecs="avc1.561028"', 'video/mp4; codecs="avc1.561029"', 'video/mp4; codecs="avc1.56102a"', 'video/mp4; codecs="avc1.561032"', 'video/mp4; codecs="avc1.561033"', 'video/mp4; codecs="avc1.561034"', 'video/mp4; codecs="avc1.56103c"', 'video/mp4; codecs="avc1.56103d"', 'video/mp4; codecs="avc1.56103e"', 'video/mp4; codecs="avc1.56103f"', 'video/mp4; codecs="avc1.561040"', 'video/mp4; codecs="avc1.561050"', 'video/mp4; codecs="avc1.56106e"', 'video/mp4; codecs="avc1.561085"', 'video/mp4; codecs="avc1.58000a"', 'video/mp4; codecs="avc1.58000b"', 'video/mp4; codecs="avc1.58000c"', 'video/mp4; codecs="avc1.58000d"', 'video/mp4; codecs="avc1.580014"', 'video/mp4; codecs="avc1.580015"', 'video/mp4; codecs="avc1.580016"', 'video/mp4; codecs="avc1.58001e"', 'video/mp4; codecs="avc1.58001f"', 'video/mp4; codecs="avc1.580020"', 'video/mp4; codecs="avc1.580028"', 'video/mp4; codecs="avc1.580029"', 'video/mp4; codecs="avc1.58002a"', 'video/mp4; codecs="avc1.580032"', 'video/mp4; codecs="avc1.580033"', 'video/mp4; codecs="avc1.580034"', 'video/mp4; codecs="avc1.58003c"', 'video/mp4; codecs="avc1.58003d"', 'video/mp4; codecs="avc1.58003e"', 'video/mp4; codecs="avc1.58003f"', 'video/mp4; codecs="avc1.580040"', 'video/mp4; codecs="avc1.580050"', 'video/mp4; codecs="avc1.58006e"', 'video/mp4; codecs="avc1.580085"', 'video/mp4; codecs="avc1.64000a"', 'video/mp4; codecs="avc1.64000b"', 'video/mp4; codecs="avc1.64000c"', 'video/mp4; codecs="avc1.64000d"', 'video/mp4; codecs="avc1.640014"', 'video/mp4; codecs="avc1.640015"', 'video/mp4; codecs="avc1.640016"', 'video/mp4; codecs="avc1.64001e"', 'video/mp4; codecs="avc1.64001f"', 'video/mp4; codecs="avc1.640020"', 'video/mp4; codecs="avc1.640028"', 'video/mp4; codecs="avc1.640029"', 'video/mp4; codecs="avc1.64002a"', 'video/mp4; codecs="avc1.640032"', 'video/mp4; codecs="avc1.640033"', 'video/mp4; codecs="avc1.640034"', 'video/mp4; codecs="avc1.64003c"', 'video/mp4; codecs="avc1.64003d"', 'video/mp4; codecs="avc1.64003e"', 'video/mp4; codecs="avc1.64003f"', 'video/mp4; codecs="avc1.640040"', 'video/mp4; codecs="avc1.640050"', 'video/mp4; codecs="avc1.64006e"', 'video/mp4; codecs="avc1.640085"', 'video/mp4; codecs="avc1.64080a"', 'video/mp4; codecs="avc1.64080b"', 'video/mp4; codecs="avc1.64080c"', 'video/mp4; codecs="avc1.64080d"', 'video/mp4; codecs="avc1.640814"', 'video/mp4; codecs="avc1.640815"', 'video/mp4; codecs="avc1.640816"', 'video/mp4; codecs="avc1.64081e"', 'video/mp4; codecs="avc1.64081f"', 'video/mp4; codecs="avc1.640820"', 'video/mp4; codecs="avc1.640828"', 'video/mp4; codecs="avc1.640829"', 'video/mp4; codecs="avc1.64082a"', 'video/mp4; codecs="avc1.640832"', 'video/mp4; codecs="avc1.640833"', 'video/mp4; codecs="avc1.640834"', 'video/mp4; codecs="avc1.64083c"', 'video/mp4; codecs="avc1.64083d"', 'video/mp4; codecs="avc1.64083e"', 'video/mp4; codecs="avc1.64083f"', 'video/mp4; codecs="avc1.640840"', 'video/mp4; codecs="avc1.640850"', 'video/mp4; codecs="avc1.64086e"', 'video/mp4; codecs="avc1.640885"', 'video/mp4; codecs="avc1.6e000a"', 'video/mp4; codecs="avc1.6e000b"', 'video/mp4; codecs="avc1.6e000c"', 'video/mp4; codecs="avc1.6e000d"', 'video/mp4; codecs="avc1.6e0014"', 'video/mp4; codecs="avc1.6e0015"', 'video/mp4; codecs="avc1.6e0016"', 'video/mp4; codecs="avc1.6e001e"', 'video/mp4; codecs="avc1.6e001f"', 'video/mp4; codecs="avc1.6e0020"', 'video/mp4; codecs="avc1.6e0028"', 'video/mp4; codecs="avc1.6e0029"', 'video/mp4; codecs="avc1.6e002a"', 'video/mp4; codecs="avc1.6e0032"', 'video/mp4; codecs="avc1.6e0033"', 'video/mp4; codecs="avc1.6e0034"', 'video/mp4; codecs="avc1.6e003c"', 'video/mp4; codecs="avc1.6e003d"', 'video/mp4; codecs="avc1.6e003e"', 'video/mp4; codecs="avc1.6e003f"', 'video/mp4; codecs="avc1.6e0040"', 'video/mp4; codecs="avc1.6e0050"', 'video/mp4; codecs="avc1.6e006e"', 'video/mp4; codecs="avc1.6e0085"', 'video/mp4; codecs="avc1.6e100a"', 'video/mp4; codecs="avc1.6e100b"', 'video/mp4; codecs="avc1.6e100c"', 'video/mp4; codecs="avc1.6e100d"', 'video/mp4; codecs="avc1.6e1014"', 'video/mp4; codecs="avc1.6e1015"', 'video/mp4; codecs="avc1.6e1016"', 'video/mp4; codecs="avc1.6e101e"', 'video/mp4; codecs="avc1.6e101f"', 'video/mp4; codecs="avc1.6e1020"', 'video/mp4; codecs="avc1.6e1028"', 'video/mp4; codecs="avc1.6e1029"', 'video/mp4; codecs="avc1.6e102a"', 'video/mp4; codecs="avc1.6e1032"', 'video/mp4; codecs="avc1.6e1033"', 'video/mp4; codecs="avc1.6e1034"', 'video/mp4; codecs="avc1.6e103c"', 'video/mp4; codecs="avc1.6e103d"', 'video/mp4; codecs="avc1.6e103e"', 'video/mp4; codecs="avc1.6e103f"', 'video/mp4; codecs="avc1.6e1040"', 'video/mp4; codecs="avc1.6e1050"', 'video/mp4; codecs="avc1.6e106e"', 'video/mp4; codecs="avc1.6e1085"', 'video/mp4; codecs="avc1.76000a"', 'video/mp4; codecs="avc1.76000b"', 'video/mp4; codecs="avc1.76000c"', 'video/mp4; codecs="avc1.76000d"', 'video/mp4; codecs="avc1.760014"', 'video/mp4; codecs="avc1.760015"', 'video/mp4; codecs="avc1.760016"', 'video/mp4; codecs="avc1.76001e"', 'video/mp4; codecs="avc1.76001f"', 'video/mp4; codecs="avc1.760020"', 'video/mp4; codecs="avc1.760028"', 'video/mp4; codecs="avc1.760029"', 'video/mp4; codecs="avc1.76002a"', 'video/mp4; codecs="avc1.760032"', 'video/mp4; codecs="avc1.760033"', 'video/mp4; codecs="avc1.760034"', 'video/mp4; codecs="avc1.76003c"', 'video/mp4; codecs="avc1.76003d"', 'video/mp4; codecs="avc1.76003e"', 'video/mp4; codecs="avc1.76003f"', 'video/mp4; codecs="avc1.760040"', 'video/mp4; codecs="avc1.760050"', 'video/mp4; codecs="avc1.76006e"', 'video/mp4; codecs="avc1.760085"', 'video/mp4; codecs="avc1.7a000a"', 'video/mp4; codecs="avc1.7a000b"', 'video/mp4; codecs="avc1.7a000c"', 'video/mp4; codecs="avc1.7a000d"', 'video/mp4; codecs="avc1.7a0014"', 'video/mp4; codecs="avc1.7a0015"', 'video/mp4; codecs="avc1.7a0016"', 'video/mp4; codecs="avc1.7a001e"', 'video/mp4; codecs="avc1.7a001f"', 'video/mp4; codecs="avc1.7a0020"', 'video/mp4; codecs="avc1.7a0028"', 'video/mp4; codecs="avc1.7a0029"', 'video/mp4; codecs="avc1.7a002a"', 'video/mp4; codecs="avc1.7a0032"', 'video/mp4; codecs="avc1.7a0033"', 'video/mp4; codecs="avc1.7a0034"', 'video/mp4; codecs="avc1.7a003c"', 'video/mp4; codecs="avc1.7a003d"', 'video/mp4; codecs="avc1.7a003e"', 'video/mp4; codecs="avc1.7a003f"', 'video/mp4; codecs="avc1.7a0040"', 'video/mp4; codecs="avc1.7a0050"', 'video/mp4; codecs="avc1.7a006e"', 'video/mp4; codecs="avc1.7a0085"', 'video/mp4; codecs="avc1.7a100a"', 'video/mp4; codecs="avc1.7a100b"', 'video/mp4; codecs="avc1.7a100c"', 'video/mp4; codecs="avc1.7a100d"', 'video/mp4; codecs="avc1.7a1014"', 'video/mp4; codecs="avc1.7a1015"', 'video/mp4; codecs="avc1.7a1016"', 'video/mp4; codecs="avc1.7a101e"', 'video/mp4; codecs="avc1.7a101f"', 'video/mp4; codecs="avc1.7a1020"', 'video/mp4; codecs="avc1.7a1028"', 'video/mp4; codecs="avc1.7a1029"', 'video/mp4; codecs="avc1.7a102a"', 'video/mp4; codecs="avc1.7a1032"', 'video/mp4; codecs="avc1.7a1033"', 'video/mp4; codecs="avc1.7a1034"', 'video/mp4; codecs="avc1.7a103c"', 'video/mp4; codecs="avc1.7a103d"', 'video/mp4; codecs="avc1.7a103e"', 'video/mp4; codecs="avc1.7a103f"', 'video/mp4; codecs="avc1.7a1040"', 'video/mp4; codecs="avc1.7a1050"', 'video/mp4; codecs="avc1.7a106e"', 'video/mp4; codecs="avc1.7a1085"', 'video/mp4; codecs="avc1.80000a"', 'video/mp4; codecs="avc1.80000b"', 'video/mp4; codecs="avc1.80000c"', 'video/mp4; codecs="avc1.80000d"', 'video/mp4; codecs="avc1.800014"', 'video/mp4; codecs="avc1.800015"', 'video/mp4; codecs="avc1.800016"', 'video/mp4; codecs="avc1.80001e"', 'video/mp4; codecs="avc1.80001f"', 'video/mp4; codecs="avc1.800020"', 'video/mp4; codecs="avc1.800028"', 'video/mp4; codecs="avc1.800029"', 'video/mp4; codecs="avc1.80002a"', 'video/mp4; codecs="avc1.800032"', 'video/mp4; codecs="avc1.800033"', 'video/mp4; codecs="avc1.800034"', 'video/mp4; codecs="avc1.80003c"', 'video/mp4; codecs="avc1.80003d"', 'video/mp4; codecs="avc1.80003e"', 'video/mp4; codecs="avc1.80003f"', 'video/mp4; codecs="avc1.800040"', 'video/mp4; codecs="avc1.800050"', 'video/mp4; codecs="avc1.80006e"', 'video/mp4; codecs="avc1.800085"', 'video/mp4; codecs="avc1.8a000a"', 'video/mp4; codecs="avc1.8a000b"', 'video/mp4; codecs="avc1.8a000c"', 'video/mp4; codecs="avc1.8a000d"', 'video/mp4; codecs="avc1.8a0014"', 'video/mp4; codecs="avc1.8a0015"', 'video/mp4; codecs="avc1.8a0016"', 'video/mp4; codecs="avc1.8a001e"', 'video/mp4; codecs="avc1.8a001f"', 'video/mp4; codecs="avc1.8a0020"', 'video/mp4; codecs="avc1.8a0028"', 'video/mp4; codecs="avc1.8a0029"', 'video/mp4; codecs="avc1.8a002a"', 'video/mp4; codecs="avc1.8a0032"', 'video/mp4; codecs="avc1.8a0033"', 'video/mp4; codecs="avc1.8a0034"', 'video/mp4; codecs="avc1.8a003c"', 'video/mp4; codecs="avc1.8a003d"', 'video/mp4; codecs="avc1.8a003e"', 'video/mp4; codecs="avc1.8a003f"', 'video/mp4; codecs="avc1.8a0040"', 'video/mp4; codecs="avc1.8a0050"', 'video/mp4; codecs="avc1.8a006e"', 'video/mp4; codecs="avc1.8a0085"', 'video/mp4; codecs="avc1.f4000a"', 'video/mp4; codecs="avc1.f4000b"', 'video/mp4; codecs="avc1.f4000c"', 'video/mp4; codecs="avc1.f4000d"', 'video/mp4; codecs="avc1.f40014"', 'video/mp4; codecs="avc1.f40015"', 'video/mp4; codecs="avc1.f40016"', 'video/mp4; codecs="avc1.f4001e"', 'video/mp4; codecs="avc1.f4001f"', 'video/mp4; codecs="avc1.f40020"', 'video/mp4; codecs="avc1.f40028"', 'video/mp4; codecs="avc1.f40029"', 'video/mp4; codecs="avc1.f4002a"', 'video/mp4; codecs="avc1.f40032"', 'video/mp4; codecs="avc1.f40033"', 'video/mp4; codecs="avc1.f40034"', 'video/mp4; codecs="avc1.f4003c"', 'video/mp4; codecs="avc1.f4003d"', 'video/mp4; codecs="avc1.f4003e"', 'video/mp4; codecs="avc1.f4003f"', 'video/mp4; codecs="avc1.f40040"', 'video/mp4; codecs="avc1.f40050"', 'video/mp4; codecs="avc1.f4006e"', 'video/mp4; codecs="avc1.f40085"', 'video/mp4; codecs="avc1.f4100a"', 'video/mp4; codecs="avc1.f4100b"', 'video/mp4; codecs="avc1.f4100c"', 'video/mp4; codecs="avc1.f4100d"', 'video/mp4; codecs="avc1.f41014"', 'video/mp4; codecs="avc1.f41015"', 'video/mp4; codecs="avc1.f41016"', 'video/mp4; codecs="avc1.f4101e"', 'video/mp4; codecs="avc1.f4101f"', 'video/mp4; codecs="avc1.f41020"', 'video/mp4; codecs="avc1.f41028"', 'video/mp4; codecs="avc1.f41029"', 'video/mp4; codecs="avc1.f4102a"', 'video/mp4; codecs="avc1.f41032"', 'video/mp4; codecs="avc1.f41033"', 'video/mp4; codecs="avc1.f41034"', 'video/mp4; codecs="avc1.f4103c"', 'video/mp4; codecs="avc1.f4103d"', 'video/mp4; codecs="avc1.f4103e"', 'video/mp4; codecs="avc1.f4103f"', 'video/mp4; codecs="avc1.f41040"', 'video/mp4; codecs="avc1.f41050"', 'video/mp4; codecs="avc1.f4106e"', 'video/mp4; codecs="avc1.f41085"', 'video/mp4; codecs="avc1"', 'video/mp4; codecs="avc2"', 'video/mp4; codecs="avc3"', 'video/mp4; codecs="avc4"', 'video/mp4; codecs="avcp"', 'video/mp4; codecs="drac"', 'video/mp4; codecs="dvav"', 'video/mp4; codecs="dvhe"', 'video/mp4; codecs="encf"', 'video/mp4; codecs="encm"', 'video/mp4; codecs="encs"', 'video/mp4; codecs="enct"', 'video/mp4; codecs="encv"', 'video/mp4; codecs="fdp "', 'video/mp4; codecs="hev1.1.6.L93.90"', 'video/mp4; codecs="hev1.1.6.L93.B0"', 'video/mp4; codecs="hev1"', 'video/mp4; codecs="hvc1.1.6.L93.90"', 'video/mp4; codecs="hvc1.1.6.L93.B0"', 'video/mp4; codecs="hvc1"', 'video/mp4; codecs="hvt1"', 'video/mp4; codecs="ixse"', 'video/mp4; codecs="lhe1"', 'video/mp4; codecs="lht1"', 'video/mp4; codecs="lhv1"', 'video/mp4; codecs="m2ts"', 'video/mp4; codecs="mett"', 'video/mp4; codecs="metx"', 'video/mp4; codecs="mjp2"', 'video/mp4; codecs="mlix"', 'video/mp4; codecs="mp4s"', 'video/mp4; codecs="mp4v"', 'video/mp4; codecs="mvc1"', 'video/mp4; codecs="mvc2"', 'video/mp4; codecs="mvc3"', 'video/mp4; codecs="mvc4"', 'video/mp4; codecs="mvd1"', 'video/mp4; codecs="mvd2"', 'video/mp4; codecs="mvd3"', 'video/mp4; codecs="mvd4"', 'video/mp4; codecs="oksd"', 'video/mp4; codecs="pm2t"', 'video/mp4; codecs="prtp"', 'video/mp4; codecs="resv"', 'video/mp4; codecs="rm2t"', 'video/mp4; codecs="rrtp"', 'video/mp4; codecs="rsrp"', 'video/mp4; codecs="rtmd"', 'video/mp4; codecs="rtp "', 'video/mp4; codecs="s263"', 'video/mp4; codecs="sm2t"', 'video/mp4; codecs="srtp"', 'video/mp4; codecs="STGS"', 'video/mp4; codecs="stpp"', 'video/mp4; codecs="svc1"', 'video/mp4; codecs="svc2"', 'video/mp4; codecs="svcM"', 'video/mp4; codecs="tc64"', 'video/mp4; codecs="tmcd"', 'video/mp4; codecs="tx3g"', 'video/mp4; codecs="unid"', 'video/mp4; codecs="urim"', 'video/mp4; codecs="vc-1"', 'video/mp4; codecs="vp08"', 'video/mp4; codecs="vp09.00.10.08"', 'video/mp4; codecs="vp09.00.50.08"', 'video/mp4; codecs="vp09.01.20.08.01.01.01.01.00"', 'video/mp4; codecs="vp09.01.20.08.01"', 'video/mp4; codecs="vp09.02.10.10.01.09.16.09.01"', 'video/mp4; codecs="vp09"', 'video/mp4; codecs="wvtt"', 'video/mpeg', 'video/mpeg2', 'video/mpeg4', 'video/msvideo', 'video/ogg', 'video/ogg; codecs="dirac, flac"', 'video/ogg; codecs="dirac, vorbis"', 'video/ogg; codecs="flac"', 'video/ogg; codecs="theora, flac"', 'video/ogg; codecs="theora, speex"', 'video/ogg; codecs="theora, vorbis"', 'video/ogg; codecs="theora"', 'video/quicktime', 'video/vnd.rn-realvideo', 'video/wavelet', 'video/webm', 'video/webm; codecs="vorbis"', 'video/webm; codecs="vp8, opus"', 'video/webm; codecs="vp8, vorbis"', 'video/webm; codecs="vp8.0, vorbis"', 'video/webm; codecs="vp8.0"', 'video/webm; codecs="vp8"', 'video/webm; codecs="vp9, opus"', 'video/webm; codecs="vp9, vorbis"', 'video/webm; codecs="vp9"', 'video/x-flv', 'video/x-la-asf', 'video/x-m4v', 'video/x-matroska', 'video/x-matroska; codecs="theora, vorbis"', 'video/x-matroska; codecs="theora"', 'video/x-mkv', 'video/x-mng', 'video/x-mpeg2', 'video/x-ms-wmv', 'video/x-msvideo', 'video/x-theora']

const getMimeTypes = async mimeTypes => {
    try {
        const videoEl = document.createElement('video')
        const audioEl = new Audio()
        const isMediaRecorderSupported = 'MediaRecorder' in window
        const types = mimeTypes.reduce((acc, type) => {
            const data = {
                mimeType: type,
                audioPlayType: audioEl.canPlayType(type),
                videoPlayType: videoEl.canPlayType(type),
                mediaSource: MediaSource.isTypeSupported(type),
                mediaRecorder: isMediaRecorderSupported ? MediaRecorder.isTypeSupported(type) : false
            }
			if (!data.audioPlayType && !data.videoPlayType && !data.mediaSource && !data.mediaRecorder) {
				return acc
			}
            acc.push(data)
            return acc
        }, [])
        return types
    } catch (error) {
        return
    }
}

export const getMedia = async imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			caniuse,
			logTestResult,
			getPromiseRaceFulfilled
		}
	} = imports

	try {
		await new Promise(setTimeout).catch(e => {})
		const start = performance.now()
		const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator
		let devices, types
		if (caniuse(() => navigator.mediaDevices.enumerateDevices)) {
			const [
				enumeratedDevices,
				mimes
			] = await Promise.all([
				phantomNavigator.mediaDevices.enumerateDevices(),
				getMimeTypes(mimeTypes)
			])
			.catch(error => console.error(error))

			types = mimes
			devices = (
				enumeratedDevices ?
				enumeratedDevices.map(device => device.kind).sort() :
				undefined
			)
		}
		else {
			types = await getMimeTypes(mimeTypes)
		}
		const constraints = caniuse(() => Object.keys(navigator.mediaDevices.getSupportedConstraints()))

		logTestResult({ start, test: 'media', passed: true })
		return { mediaDevices: devices, constraints, mimeTypes: types }
	}
	catch (error) {
		logTestResult({ test: 'media', passed: false })
		captureError(error)
		return
	}
}

export const mediaHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
	if (!fp.media) {
		return `
		<div class="col-four undefined">
			<strong>Media</strong>
			<div>devices (0): ${note.blocked}</div>
			<div>constraints: ${note.blocked}</div>
			<div>mimes (0): ${note.blocked}</div>
		</div>`
	}
	const {
		media: {
			mediaDevices,
			constraints,
			mimeTypes,
			$hash
		}
	} = fp

	const header = `
	<style>
		.audiop, .videop, .medias, .mediar, .blank-false {
			padding: 2px 8px;
		}
		.audiop {
			background: #657fca26;
		}
		.medias {
			background: #657fca54;
		}
		.videop {
			background: #ca65b424;
		}
		.mediar {
			background: #ca65b459;
		}
		.audiop.pb, .videop.pb, .guide.pr {
			color: #8f8ff1 !important;
		}
		.audiop.mb, .videop.mb, .guide.mb {
			color: #98cee4 !important;
		}
		.medias.tr, .mediar.tr, .guide.tr {
			color: #c778ba !important;
		}
	</style>
	<div>
	<br><span class="audiop">audioPlayType</span>
	<br><span class="videop">videoPlayType</span>
	<br><span class="medias">mediaSource</span>
	<br><span class="mediar">mediaRecorder</span>
	<br><span class="guide pr">P (Probably)</span>
	<br><span class="guide mb">M (Maybe)</span>
	<br><span class="guide tr">T (True)</span>
	</div>`
	const invalidMimeTypes = !mimeTypes || !mimeTypes.length
	const mimes = invalidMimeTypes ? undefined : mimeTypes.map(type => {
		const { mimeType, audioPlayType, videoPlayType, mediaSource, mediaRecorder } = type
		return `
			${audioPlayType == 'probably' ? '<span class="audiop pb">P</span>' : audioPlayType == 'maybe' ? '<span class="audiop mb">M</span>': '<span class="blank-false">-</span>'}${videoPlayType == 'probably' ? '<span class="videop pb">P</span>' : videoPlayType == 'maybe' ? '<span class="videop mb">M</span>': '<span class="blank-false">-</span>'}${mediaSource ? '<span class="medias tr">T</span>'  : '<span class="blank-false">-</span>'}${mediaRecorder ? '<span class="mediar tr">T</span>'  : '<span class="blank-false">-</span>'}: ${mimeType}
		`	
	})

	return `
	<div class="col-four">
		<strong>Media</strong><span class="hash">${hashSlice($hash)}</span>
		<div>devices (${count(mediaDevices)}): ${
			!mediaDevices || !mediaDevices.length ? note.blocked : 
			modal(
				'creep-media-devices',
				mediaDevices.join('<br>'),
				hashMini(mediaDevices)
			)
		}</div>
		<div>constraints: ${
			!constraints || !constraints.length ? note.blocked : 
			modal(
				'creep-media-constraints',
				constraints.join('<br>'),
				hashMini(constraints)
			)
		}</div>
		<div>mimes (${count(mimeTypes)}): ${
			invalidMimeTypes ? note.blocked : 
			modal(
				'creep-media-mimeTypes',
				header+mimes.join('<br>'),
				hashMini(mimeTypes)
			)
		}</div>
	</div>
	`	
}