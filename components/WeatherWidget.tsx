'use client';

import { useState, useEffect } from 'react';

interface Weather {
  temp: number; humidity: number; windspeed: number;
  weathercode: number; rain: number; location: string;
  forecast: { date: string; max: number; min: number; code: number; rain: number }[];
}
const WMO: Record<number, { label: string; icon: string }> = {
  0:{label:'Clear Sky',icon:'☀️'},1:{label:'Mainly Clear',icon:'🌤️'},2:{label:'Partly Cloudy',icon:'⛅'},
  3:{label:'Overcast',icon:'☁️'},45:{label:'Foggy',icon:'🌫️'},48:{label:'Icy Fog',icon:'🌫️'},
  51:{label:'Light Drizzle',icon:'🌦️'},61:{label:'Light Rain',icon:'🌧️'},63:{label:'Moderate Rain',icon:'🌧️'},
  65:{label:'Heavy Rain',icon:'🌧️'},71:{label:'Light Snow',icon:'❄️'},80:{label:'Rain Showers',icon:'🌦️'},95:{label:'Thunderstorm',icon:'⛈️'},
};
function wmo(c:number){return WMO[c]||WMO[Math.floor(c/10)*10]||{label:'Unknown',icon:'🌡️'};}
function sprayAdvice(temp:number,wind:number,rain:number,hum:number){
  if(rain>1)return{ok:false,msg:'Rain expected — avoid spraying today'};
  if(wind>20)return{ok:false,msg:'Wind too strong for spraying'};
  if(temp>38)return{ok:false,msg:'Too hot — spray early morning instead'};
  if(hum<30)return{ok:false,msg:'Low humidity — poor pesticide absorption'};
  return{ok:true,msg:'Good conditions to spray pesticide today ✓'};
}
export default function WeatherWidget(){
  const [weather,setWeather]=useState<Weather|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!navigator.geolocation){setLoading(false);return;}
    navigator.geolocation.getCurrentPosition(async({coords})=>{
      try{
        const [wr,gr]=await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,windspeed_10m,weathercode,rain&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=4`),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`),
        ]);
        const w=await wr.json();const g=await gr.json();
        const loc=g.address?.village||g.address?.town||g.address?.city||'Your Location';
        setWeather({
          temp:Math.round(w.current.temperature_2m),humidity:w.current.relative_humidity_2m,
          windspeed:Math.round(w.current.windspeed_10m),weathercode:w.current.weathercode,rain:w.current.rain,location:loc,
          forecast:w.daily.time.slice(1,4).map((date:string,i:number)=>({
            date,max:Math.round(w.daily.temperature_2m_max[i+1]),min:Math.round(w.daily.temperature_2m_min[i+1]),
            code:w.daily.weathercode[i+1],rain:Math.round(w.daily.precipitation_sum[i+1]||0),
          })),
        });
      }catch{/* silent */}finally{setLoading(false);}
    },()=>setLoading(false));
  },[]);
  if(loading)return(
    <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3">
      <span className="spinner" style={{width:16,height:16,borderWidth:2}}/>
      <p className="text-sm" style={{color:'var(--text-muted)'}}>Fetching live weather...</p>
    </div>
  );
  if(!weather)return null;
  const {ok,msg}=sprayAdvice(weather.temp,weather.windspeed,weather.rain,weather.humidity);
  const cur=wmo(weather.weathercode);
  return(
    <div className="glass-card rounded-2xl p-4 mb-4" style={{border:'1px solid rgba(96,165,250,0.2)'}}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><span>📍</span><p className="text-xs font-semibold" style={{color:'var(--text-muted)'}}>{weather.location} — Live</p></div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(96,165,250,0.1)',color:'#93c5fd'}}>Open-Meteo</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cur.icon}</span>
          <div><p className="text-3xl font-black" style={{color:'var(--text-primary)'}}>{weather.temp}°C</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{cur.label}</p></div>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-xs" style={{color:'var(--text-muted)'}}>💧 {weather.humidity}% humidity</p>
          <p className="text-xs" style={{color:'var(--text-muted)'}}>💨 {weather.windspeed} km/h wind</p>
          <p className="text-xs" style={{color:'var(--text-muted)'}}>🌧️ {weather.rain} mm rain</p>
        </div>
      </div>
      <div className="rounded-xl px-3 py-2 mb-3 flex items-center gap-2"
        style={{background:ok?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.1)',border:`1px solid ${ok?'rgba(34,197,94,0.25)':'rgba(245,158,11,0.25)'}`}}>
        <span>{ok?'✅':'⚠️'}</span>
        <p className="text-xs font-semibold" style={{color:ok?'#4ade80':'#fcd34d'}}>{msg}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {weather.forecast.map((d)=>(
          <div key={d.date} className="rounded-xl p-2.5 text-center" style={{background:'rgba(6,26,13,0.7)'}}>
            <p className="text-xs mb-1" style={{color:'var(--text-muted)'}}>{new Date(d.date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'})}</p>
            <span className="text-xl">{wmo(d.code).icon}</span>
            <p className="text-xs mt-1 font-semibold" style={{color:'var(--text-primary)'}}>{d.max}° <span style={{color:'var(--text-muted)'}}>{d.min}°</span></p>
            {d.rain>0&&<p className="text-xs mt-0.5" style={{color:'#93c5fd'}}>💧{d.rain}mm</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
