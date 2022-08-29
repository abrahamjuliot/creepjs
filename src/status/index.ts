import { hashMini } from '../utils/crypto';
import { HTMLNote } from '../utils/html';

const GIGABYTE = 1073741824 // bytes

function getMaxCallStackSize(): number {
  const fn = (): number => {
    try {
      return 1+fn()
    } catch (err) {
      return 1
    }
  }
  ;[...Array(10)].forEach(() => fn()) // stabilize
  return fn()
}

// based on and inspired by
// https://github.com/Joe12387/OP-Fingerprinting-Script/blob/main/opfs.js#L443
function getTimingResolution(): [number, number] {
  const maxRuns = 5000
  let valA = 1
  let valB = 1
  let res

  for (let i = 0; i < maxRuns; i++) {
    const a = performance.now()
    const b = performance.now()
    if (a < b) {
      res = b - a
      if (res > valA && res < valB) {
        valB = res
      } else if (res < valA) {
        valB = valA
        valA = res
      }
    }
  }

  return [valA, valB]
}

function getClientLitter(): string[] {
  try {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const iframeWindow = iframe.contentWindow
    const windowKeys = Object.getOwnPropertyNames(window)
    const iframeKeys = Object.getOwnPropertyNames(iframeWindow)
    document.body.removeChild(iframe)
    const clientKeys = windowKeys.filter((x) => !iframeKeys.includes(x))
    return clientKeys
  } catch (err) {
    return []
  }
}

interface BatteryManager {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}
async function getBattery(): Promise<BatteryManager | null> {
  if (!('getBattery' in navigator)) return null
  // @ts-expect-error if not supported
  return navigator.getBattery()
}

async function getStorage(): Promise<number | null> {
  if (!navigator?.storage?.estimate) return null
  return Promise.all([
    navigator.storage.estimate().then(({ quota }) => quota),
    new Promise((resolve) => {
      // @ts-expect-error if not supported
      navigator.webkitTemporaryStorage.queryUsageAndQuota((_, quota) => {
        resolve(quota)
      })
    }).catch(() => null),
  ]).then(([quota1, quota2]) => (quota2 || quota1) as number)
}

async function getScriptSize(): Promise<number | null> {
  let url = null
  try {
    // @ts-expect-error if unsupported
    url = document?.currentScript?.src || import.meta.url
  } catch (err) { }

  if (!url) return null
  return fetch(url)
    .then((res) => res.blob())
    .then((blob) => blob.size)
    .catch(() => null)
}

interface Status {
    charging?: boolean
    chargingTime?: number
    dischargingTime?: number
    level?: number
    memory: number | null;
    memoryInGigabytes: number | null;
    quota: number | null;
    quotaInGigabytes: number | null;
    downlink?: number
    effectiveType?: string
    rtt?: number | undefined;
    saveData?: boolean
    downlinkMax?: number
    type?: ConnectionType
    stackSize: number,
    timingRes: [number, number],
    clientLitter: string[],
    scripts: string[],
    scriptSize: number | null,
}
export async function getStatus(): Promise<Status> {
  const [
    batteryInfo,
    quota,
    scriptSize,
    stackSize,
    timingRes,
    clientLitter,
  ] = await Promise.all([
    getBattery(),
    getStorage(),
    getScriptSize(),
    getMaxCallStackSize(),
    getTimingResolution(),
    getClientLitter().sort().slice(0, 40),
  ])

  // BatteryManager
  const {
    charging,
    chargingTime,
    dischargingTime,
    level,
  } = batteryInfo || {}

  // MemoryInfo
  // @ts-expect-error if not supported
  const memory = performance?.memory?.jsHeapSizeLimit || null
  const memoryInGigabytes = memory ? +(memory/GIGABYTE).toFixed(2) : null

  // StorageManager
  const quotaInGigabytes = quota ? +(+(quota)/GIGABYTE).toFixed(2) : null

  // Network Info
  const {
    downlink, effectiveType, rtt, saveData, downlinkMax, type,
  } = navigator?.connection as NetworkInformation & {
    downlink?: number,
    effectiveType?: string,
    rtt?: number,
    saveData?: boolean,
    downlinkMax?: number,
  } || {}

  const scripts: string[] = [
    ...document.querySelectorAll('script'),
  ].map((x) => x.src.replace(/^https?:\/\//, '')).slice(0, 10)

  return {
    charging,
    chargingTime,
    dischargingTime,
    level,
    memory,
    memoryInGigabytes,
    quota,
    quotaInGigabytes,
    downlink,
    effectiveType,
    rtt,
    saveData,
    downlinkMax,
    type,
    stackSize,
    timingRes,
    clientLitter,
    scripts,
    scriptSize,
  }
}

export function statusHTML(status: Status) {
	if (!status) {
		return `
			<div class="col-four">
				<strong>Status</strong>
        <div>network:</div>
        <div class="block-text">${HTMLNote.BLOCKED}</div>
			</div>
      <div class="col-four">
				<div>battery:</div>
        <div class="block-text-large">${HTMLNote.BLOCKED}</div>
			</div>
      <div class="col-four">
				<div>available:</div>
        <div class="block-text-large">${HTMLNote.BLOCKED}</div>
			</div>
		`
	}

  const {
    charging,
    chargingTime,
    dischargingTime,
    level,
    memory,
    memoryInGigabytes,
    quota,
    quotaInGigabytes,
    downlink,
    effectiveType,
    rtt,
    saveData,
    downlinkMax,
    type,
    stackSize,
    timingRes,
  } = status

	const statusHash = hashMini({
		memoryInGigabytes,
    quotaInGigabytes,
    timingRes,
    rtt: rtt === 0 ? 0 : -1,
    type,
	})

	return `
    <div class="col-four">
      <strong>Status</strong><span class="hash">${statusHash}</span>
      <div>network:</div>
      <div class="block-text unblurred help" title="Navigator.connection">${
        isNaN(Number(rtt)) ? HTMLNote.UNSUPPORTED : `
          <div>rtt: ${rtt}, downlink: ${downlink}${downlinkMax ? `, max: ${downlinkMax}`: ''}</div>
          <div>effectiveType: ${effectiveType}</div>
          <div>saveData: ${saveData}${type ? `, type: ${type}`: ''}</div>
        `}
      </div>
    </div>
    <div class="col-four">
      <div>battery:</div>
      <div class="block-text-large unblurred help" title="Navigator.getBattery()">${
        !level || isNaN(Number(level)) ? HTMLNote.UNSUPPORTED : `
        <div>level: ${level*100}%</div>
        <div>charging: ${charging}</div>
        <div>charge time: ${
        chargingTime === Infinity ? 'discharging' :
          chargingTime === 0 ? 'fully charged' :
            `${+(chargingTime! / 60).toFixed(1)} min.`
      }</div>
        <div>discharge time: ${
          dischargingTime === Infinity ? 'charging' :
            `${+(dischargingTime! / 60).toFixed(1)} min.`
        }</div>
      `}</div>
    </div>
    <div class="col-four">
      <div>available:</div>
      <div class="block-text-large unblurred help" title="StorageManager.estimate()\nPerformance.memory">
        ${
          quota ? `<div>storage: ${quotaInGigabytes}GB<br>[${quota}]</div>` : ''
        }
        ${
          memory ? `<div>memory: ${memoryInGigabytes}GB<br>[${memory}]</div>` : ''
        }
        ${
          timingRes ? `<div>timing res:<br>${timingRes.join('<br>')}</div>` : ''
        }
        <div>stack: ${stackSize || HTMLNote.BLOCKED}</div>
      </div>
    </div>
	`
}
