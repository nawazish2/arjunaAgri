'use client';
import AuthGuard from '@/components/AuthGuard';
import { useState } from 'react';

const CROPS: Record<string, { n:number;p:number;k:number;label:string;icon:string }> = {
  wheat:    {n:120,p:60, k:40, label:'Wheat (गेहूं)',   icon:'🌾'},
  rice:     {n:120,p:60, k:60, label:'Rice (धान)',      icon:'🌾'},
  cotton:   {n:150,p:60, k:60, label:'Cotton (कपास)',   icon:'🌿'},
  sugarcane:{n:250,p:60, k:60, label:'Sugarcane (गन्ना)',icon:'🎋'},
  maize:    {n:150,p:75, k:40, label:'Maize (मक्का)',   icon:'🌽'},
  soybean:  {n:30, p:60, k:40, label:'Soybean (सोयाबीन)',icon:'🫘'},
  mustard:  {n:80, p:40, k:40, label:'Mustard (सरसों)', icon:'��'},
  potato:   {n:180,p:80, k:100,label:'Potato (आलू)',    icon:'🥔'},
  tomato:   {n:150,p:100,k:150,label:'Tomato (टमाटर)',  icon:'🍅'},
  onion:    {n:100,p:50, k:100,label:'Onion (प्याज)',   icon:'🧅'},
};
const FERTS = {
  urea:{n:46,p:0, k:0, label:'Urea',pricePerKg:5.4, color:'#4ade80'},
  dap: {n:18,p:46,k:0, label:'DAP', pricePerKg:27,  color:'#60a5fa'},
  mop: {n:0, p:0, k:60,label:'MOP', pricePerKg:17,  color:'#fcd34d'},
  ssp: {n:0, p:16,k:0, label:'SSP', pricePerKg:8,   color:'#c084fc'},
};
function calcScore(n:number,p:number,k:number,ph:number,moist:number,opt:{n:number;p:number;k:number}){
  const ns=Math.min((n/opt.n)*100,100),ps=Math.min((p/opt.p)*100,100),ks=Math.min((k/opt.k)*100,100);
  const phs=ph>=6&&ph<=7.5?100:ph>=5.5&&ph<=8?70:40;
  const ms=moist>=30&&moist<=70?100:moist>=20?60:30;
  const liebig=Math.min(ns,ps,ks);
  return Math.round(liebig*0.5+phs*0.25+ms*0.15+(ns+ps+ks)/3*0.1);
}
function grade(s:number){
  if(s>=80)return{g:'A',color:'#4ade80',label:'Excellent'};
  if(s>=60)return{g:'B',color:'#fcd34d',label:'Good'};
  if(s>=40)return{g:'C',color:'#fb923c',label:'Average'};
  return{g:'D',color:'#f87171',label:'Poor — needs attention'};
}
interface Result{crop:string;defN:number;defP:number;defK:number;urea:number;dap:number;mop:number;ssp:number;totalCost:number;score:number;topLimit:string;useDAP:boolean}
export default function FertilizerPage(){
  const [form,setForm]=useState({n:0,p:0,k:0,ph:6.5,moisture:40,area:1,crop:'wheat',useDAP:true});
  const [result,setResult]=useState<Result|null>(null);

  const calc=()=>{
    const opt=CROPS[form.crop];
    const ha=form.area*0.405;
    const defN=Math.max(0,opt.n-form.n),defP=Math.max(0,opt.p-form.p),defK=Math.max(0,opt.k-form.k);
    let urea=0,dap=0,mop=0,ssp=0;
    if(form.useDAP){
      dap=defP>0?defP/(FERTS.dap.p/100):0;
      const nFromDAP=dap*(FERTS.dap.n/100);
      urea=Math.max(0,defN-nFromDAP)/(FERTS.urea.n/100);
    } else {
      ssp=defP>0?defP/(FERTS.ssp.p/100):0;
      urea=defN>0?defN/(FERTS.urea.n/100):0;
    }
    mop=defK>0?defK/(FERTS.mop.k/100):0;
    const u=Math.round(urea*ha),d=Math.round(dap*ha),m=Math.round(mop*ha),s=Math.round(ssp*ha);
    const cost=u*FERTS.urea.pricePerKg+d*FERTS.dap.pricePerKg+m*FERTS.mop.pricePerKg+s*FERTS.ssp.pricePerKg;
    const score=calcScore(form.n,form.p,form.k,form.ph,form.moisture,opt);
    const defs=[{name:'Nitrogen',d:defN},{name:'Phosphorus',d:defP},{name:'Potassium',d:defK}].sort((a,b)=>b.d-a.d);
    setResult({crop:CROPS[form.crop].label,defN,defP,defK,urea:u,dap:d,mop:m,ssp:s,totalCost:Math.round(cost),score,topLimit:defs[0].name,useDAP:form.useDAP});
  };

  return (
    <AuthGuard>
    <div className="min-h-screen relative overflow-hidden">
      <div className="orb w-72 h-72 -top-16 -right-16" style={{background:'#22c55e'}}/>
      <div className="orb w-48 h-48 bottom-24 -left-12" style={{background:'#60a5fa',animationDelay:'2s'}}/>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
        <h1 className="text-2xl font-bold gradient-text mb-1">Fertilizer Calculator</h1>
        <p className="text-sm mb-5" style={{color:'var(--text-secondary)'}}>Exact Urea/DAP/MOP doses for your soil & crop</p>

        {/* Soil NPK */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2"><span>🧪</span><span style={{color:'var(--accent-green)'}}>Your Soil NPK</span><span className="text-xs font-normal ml-1" style={{color:'var(--text-muted)'}}>(kg/ha)</span></h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {([{k:'n',label:'Nitrogen N',color:'#4ade80'},{k:'p',label:'Phosphorus P',color:'#60a5fa'},{k:'k',label:'Potassium K',color:'#fcd34d'}] as const).map(({k,label,color})=>(
              <div key={k}>
                <label className="block text-xs font-bold mb-1.5" style={{color}}>{label}</label>
                <input type="number" min={0} placeholder="0" value={(form as Record<string,number|boolean|string>)[k] as number||''}
                  onChange={e=>setForm({...form,[k]:parseFloat(e.target.value)||0})}
                  className="input-field text-center font-bold" style={{borderColor:color+'40'}}/>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-muted)'}}>pH Level</label>
              <input type="number" step="0.1" min={0} max={14} value={form.ph} onChange={e=>setForm({...form,ph:parseFloat(e.target.value)||7})} className="input-field"/></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-muted)'}}>Moisture %</label>
              <input type="number" min={0} max={100} value={form.moisture} onChange={e=>setForm({...form,moisture:parseFloat(e.target.value)||0})} className="input-field"/></div>
          </div>
        </div>

        {/* Crop & area */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2"><span>🌾</span><span style={{color:'var(--accent-amber)'}}>Crop & Field</span></h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(CROPS).map(([key,c])=>(
              <button key={key} type="button" onClick={()=>setForm({...form,crop:key})}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left"
                style={{background:form.crop===key?'rgba(34,197,94,0.15)':'rgba(6,26,13,0.6)',border:`1px solid ${form.crop===key?'#22c55e':'rgba(34,197,94,0.1)'}`,color:form.crop===key?'#4ade80':'var(--text-secondary)'}}>
                <span>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-muted)'}}>Field Size (Acres)</label>
              <input type="number" min={0.1} step={0.5} value={form.area} onChange={e=>setForm({...form,area:parseFloat(e.target.value)||1})} className="input-field"/></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-muted)'}}>P Source</label>
              <div className="flex rounded-xl overflow-hidden" style={{border:'1px solid rgba(34,197,94,0.2)',background:'rgba(6,26,13,0.8)'}}>
                {[{v:true,l:'DAP'},{v:false,l:'SSP'}].map(({v,l})=>(
                  <button key={l} type="button" onClick={()=>setForm({...form,useDAP:v})}
                    className="flex-1 py-2.5 text-sm font-semibold transition-all"
                    style={{background:form.useDAP===v?'#22c55e':'transparent',color:form.useDAP===v?'#061a0d':'var(--text-muted)'}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={calc} className="btn-primary w-full justify-center py-4 text-base rounded-2xl mb-5">
          🧮 Calculate Fertilizer Dose
        </button>

        {result&&(
          <div className="space-y-3 page-enter">
            {/* Health Score */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold" style={{color:'var(--text-primary)'}}>Soil Health Score</h3>
                  <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Based on Liebig&apos;s Law of Minimum</p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl border-2"
                  style={{borderColor:grade(result.score).color,color:grade(result.score).color,background:grade(result.score).color+'15'}}>
                  {grade(result.score).g}
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden mb-2" style={{background:'rgba(255,255,255,0.06)'}}>
                <div className="h-full rounded-full" style={{width:`${result.score}%`,background:'linear-gradient(90deg,#f87171,#fcd34d,#4ade80)',transition:'width 0.7s'}}/>
              </div>
              <div className="flex justify-between text-xs" style={{color:'var(--text-muted)'}}>
                <span>{result.score}/100 — {grade(result.score).label}</span>
                <span>⚡ Most limiting: {result.topLimit}</span>
              </div>
            </div>

            {/* Deficit */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-bold mb-3 text-xs uppercase tracking-wider" style={{color:'var(--text-muted)'}}>Deficiency vs {result.crop}</h3>
              <div className="grid grid-cols-3 gap-3">
                {[{label:'N Deficit',val:result.defN,color:'#4ade80'},{label:'P Deficit',val:result.defP,color:'#60a5fa'},{label:'K Deficit',val:result.defK,color:'#fcd34d'}].map(({label,val,color})=>(
                  <div key={label} className="rounded-xl p-3 text-center" style={{background:'rgba(6,26,13,0.6)',border:`1px solid ${color}25`}}>
                    <p className="text-xs mb-1" style={{color:'var(--text-muted)'}}>{label}</p>
                    <p className="text-xl font-black" style={{color:val>0?color:'rgba(74,222,128,0.3)'}}>{val}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>kg/ha</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy This */}
            <div className="glass-card rounded-2xl p-5 glow-green">
              <h3 className="font-bold mb-4" style={{color:'var(--text-primary)'}}>🛒 Buy This — {form.area} Acre{form.area>1?'s':''}</h3>
              <div className="space-y-2.5">
                {[
                  {label:'Urea',qty:result.urea,color:'#4ade80',icon:'🟢',ppu:FERTS.urea.pricePerKg},
                  result.useDAP&&{label:'DAP',qty:result.dap,color:'#60a5fa',icon:'🔵',ppu:FERTS.dap.pricePerKg},
                  !result.useDAP&&{label:'SSP',qty:result.ssp,color:'#c084fc',icon:'🟣',ppu:FERTS.ssp.pricePerKg},
                  {label:'MOP',qty:result.mop,color:'#fcd34d',icon:'🟡',ppu:FERTS.mop.pricePerKg},
                ].filter(Boolean).map(f=>{
                  const item=f as {label:string;qty:number;color:string;icon:string;ppu:number};
                  if(item.qty<=0)return null;
                  return(
                    <div key={item.label} className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{background:'rgba(6,26,13,0.7)',border:`1px solid ${item.color}25`}}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="font-bold text-sm" style={{color:'var(--text-primary)'}}>{item.label}</p>
                          <p className="text-xs" style={{color:'var(--text-muted)'}}>₹{item.ppu}/kg</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl" style={{color:item.color}}>{item.qty} kg</p>
                        <p className="text-xs font-semibold" style={{color:'#fcd34d'}}>≈ ₹{Math.round(item.qty*item.ppu).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                <p className="text-sm font-semibold" style={{color:'var(--text-secondary)'}}>Total Cost</p>
                <p className="text-2xl font-black" style={{color:'#22c55e'}}>₹{result.totalCost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Application schedule */}
            <div className="glass-card-amber rounded-2xl p-4">
              <p className="text-xs font-bold mb-2" style={{color:'#fcd34d'}}>📋 Application Schedule</p>
              <ul className="space-y-1.5 text-sm" style={{color:'var(--text-secondary)'}}>
                <li>• Apply <strong>DAP/SSP + MOP</strong> at sowing (basal dose)</li>
                <li>• Apply <strong>⅓ Urea</strong> at sowing, <strong>⅓</strong> at first irrigation</li>
                <li>• Apply remaining <strong>⅓ Urea</strong> at 30–35 days after sowing</li>
                <li>• Always apply on moist soil for best absorption</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
