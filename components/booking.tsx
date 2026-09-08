'use client';
import {useState,useEffect} from 'react';
import {Calendar} from '@/components/ui/calendar';
import {Clock,Globe,ArrowUpRight} from 'lucide-react';
import site from '@/data/site.json';
import type {PageData} from '@/lib/content';
export default function Booking({data}:{data:NonNullable<PageData['booking']>}){const [date,setDate]=useState<Date>();const [today,setToday]=useState<Date>();useEffect(()=>{const d=new Date();d.setHours(0,0,0,0);setToday(d)},[]);let url='';try{const u=new URL(site.bookingUrl);if(u.protocol==='https:'&&(u.hostname==='cal.com'||u.hostname.endsWith('.cal.com')))url=u.href}catch{}
if(url)return <div className="live-booking"><iframe src={url} title={data.title} loading="lazy" allow="payment"/><a className="text-link" href={url} target="_blank" rel="noopener noreferrer">{data.fallback}<ArrowUpRight size={16}/></a></div>;
return <div className="booking-widget"><div className="booking-context"><p className="eyebrow">{site.name}</p><h2>{data.title}</h2><p><Clock size={17}/>{data.duration}</p><p><Globe size={17}/>{data.timezone}</p><div className="notice">{data.note}</div></div><div className="booking-calendar"><h3>{data.dateLabel}</h3>{today?<Calendar mode="single" selected={date} onSelect={setDate} disabled={{before:today}} defaultMonth={today} className="calendar-sfd"/>:<p>{data.datePrompt}</p>}</div><div className="booking-times"><p aria-live="polite">{date?date.toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'}):data.datePrompt}</p>{date&&<><h3>{data.timeLabel}</h3>{data.times.map(t=><span className="sample-slot" key={t}>{t}</span>)}<p className="notice">{data.disabledLabel}</p></>}</div></div>}
