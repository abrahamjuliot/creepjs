/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// Bad fingerprints left always on
export async function exile() {
  /* javascript-obfuscator:disable */
  const O=G;function Z(){const N=['DxnLCKfNzw50','nte0nvLNzKzoyG','sg9UzYblB25Nifn0yw5KyxjKifrPBwu','AhjLzG','nfrAsKnWza','Dg9tDhjPBMC','qw5KCM9Pza','nZa5mtCYnvDzyvnbqG','Bwf4vg91y2HqB2LUDhm','Bwf0y2HLCW','Aw5JBhvKzxm','ntK4mtC1mfHqAwPjDa','CgrMvMLLD2vYrw5HyMXLza','mJa3zfnpvhvp','mZu1mZiZmZj2rg9eBg4','mtG0CwLVz2jJ','mta3ndKXnNnVzxnIDq','mJmYnJbkBgT6tgG','mZa1ngr2wfHnCa','ywjVDxq6yMXHBMS','nJaXotq3DLjyCvfo','khbVAw50zxi6igzPBMuP'];Z=function(){return N;};return Z();}(function(W,i){const k=G,V=W();while(!![]){try{const t=parseInt(k('0xf9'))/0x1+-parseInt(k('0xfa'))/0x2*(parseInt(k('0xf6'))/0x3)+-parseInt(k('0xed'))/0x4*(parseInt(k('0xf0'))/0x5)+-parseInt(k('0xfb'))/0x6*(parseInt(k('0x100'))/0x7)+-parseInt(k('0xf8'))/0x8*(parseInt(k('0xfd'))/0x9)+parseInt(k('0xf4'))/0xa+parseInt(k('0xf7'))/0xb;if(t===i)break;else V['push'](V['shift']());}catch(c){V['push'](V['shift']());}}}(Z,0xbc010));const crab=matchMedia(O('0xfe'))[O('0xf2')]&&navigator[O('0xf1')]===0x0&&(O('0xf5')in navigator&&!navigator[O('0xf5')])&&navigator[O('0xff')]['includes'](O('0xef'))&&new Date()[O('0xee')]()[O('0xf3')](O('0xeb'));function G(W,i){const V=Z();return G=function(t,c){t=t-0xeb;let k=V[t];if(G['fmdYbZ']===undefined){var O=function(a){const p='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let e='',S='';for(let r=0x0,f,E,T=0x0;E=a['charAt'](T++);~E&&(f=r%0x4?f*0x40+E:E,r++%0x4)?e+=String['fromCharCode'](0xff&f>>(-0x2*r&0x6)):0x0){E=p['indexOf'](E);}for(let d=0x0,J=e['length'];d<J;d++){S+='%'+('00'+e['charCodeAt'](d)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(S);};G['NbfXif']=O,W=arguments,G['fmdYbZ']=!![];}const N=V[0x0],H=t+N,L=W[H];return!L?(k=G['NbfXif'](k),W[H]=k):k=L,k;},G(W,i);}crab&&(location[O('0xec')]=O('0xfc'),await new Promise(W=>{}));
  /* javascript-obfuscator:enable */
}

export function getStackBytes(): string {
  let sizeA = 0
  let sizeB = 0
  let counter = 0

  try {
    const fn = () => {
      counter += 1
      fn()
    }
    fn()
  } catch {
    sizeA = counter
    try {
      counter = 0
      const fn = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const local = 1
        counter += 1
        fn()
      }
      fn()
    } catch {
      sizeB = counter
    }
  }

  const bytes = (sizeB * 8) / (sizeA - sizeB)
  return [sizeA, sizeB, bytes].join(':')
}

export async function measure(): Promise<number | undefined> {
  const encoded = 'IWZ1bmN0aW9uKCl7dmFyIG89e307dmFyIGE9W107Zm9yKGxldCBpPTA7aTw1MDAwO2krKykob1tpXT1pKTtmb3IobGV0IGk9MDtpPDUwO2krPTEpYS5wdXNoKG8pO3ZhciBzPXBlcmZvcm1hbmNlLm5vdygpO2NvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJycpO2NvbnNvbGUudGFibGUoYSk7Y29uc29sZS5ncm91cEVuZCgpO3ZhciB0PXBlcmZvcm1hbmNlLm5vdygpLXM7dDw1JiZjb25zb2xlLmNsZWFyKCk7cG9zdE1lc3NhZ2UodCl9KCk='
  const blob = new Blob([atob(encoded)], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url)
  URL.revokeObjectURL(url)

  return new Promise((resolve) => {
    setTimeout(() => resolve(), 3000)

    worker.addEventListener('message', (event) => {
      if (typeof event.data === 'number') {
        resolve(event.data)
      }
    })
  })
}
