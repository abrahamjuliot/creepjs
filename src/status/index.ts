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

interface BatteryManager {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}
async function getBattery(): Promise<BatteryManager | null> {
  if (!('getBattery' in navigator)) return null
  // @ts-expect-error
  return navigator.getBattery()
}

async function getStorage(): Promise<number | null> {
  if (!navigator?.storage?.estimate) return null
  return Promise.all([
    navigator.storage.estimate().then(({ quota }) => quota),
    new Promise((resolve) => {
      // @ts-expect-error
      navigator.webkitTemporaryStorage.queryUsageAndQuota((_, quota) => {
        resolve(quota)
      })
    }).catch(() => null),
  ]).then(([quota1, quota2]) => (quota2 || quota1) as number)
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
    stackSize: number
}
export async function getStatus(): Promise<Status> {
  const [
    batteryInfo,
    quota,
  ] = await Promise.all([
    getBattery(),
    getStorage(),
  ])

  // BatteryManager
  const {
    charging,
    chargingTime,
    dischargingTime,
    level,
  } = batteryInfo || {}

  // MemoryInfo
  // @ts-expect-error
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

  // Stack Size
  const stackSize = getMaxCallStackSize()

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
  } = status

	const statusHash = hashMini({
		memoryInGigabytes,
    quotaInGigabytes,
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
        <div>stack: ${stackSize || HTMLNote.BLOCKED}</div>
      </div>
    </div>
	`
}
