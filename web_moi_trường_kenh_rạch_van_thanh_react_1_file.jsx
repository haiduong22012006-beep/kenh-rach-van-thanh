import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BookOpen, Leaf, MapPin, Trophy, Gift, Plus, Trash2, AlertTriangle, CalendarDays, Users, ChevronRight, Sun, CloudRain, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * WEB: Môi trường kênh Rạch Văn Thánh
 * - Sổ tay kiến thức về phân loại rác, cảnh báo ô nhiễm, hướng dẫn xử lý
 * - Đo lường mức độ ô nhiễm bằng mã màu
 * - Sự kiện "Chủ nhật xanh": điểm danh, xếp hạng, tích điểm & đổi quà
 * - Biểu đồ cảnh báo lượng rác & thông báo thời tiết xấu
 *
 * Lưu dữ liệu: localStorage
 * Thư viện UI: shadcn/ui, tailwindcss, lucide-react, recharts, framer-motion
 */

// ----------------------- helpers & storage -----------------------
const LS_KEYS = {
  hotspots: "krvt_hotspots",
  events: "krvt_events",
  people: "krvt_people",
  rewards: "krvt_rewards",
  alerts: "krvt_alerts",
};

const defaultHotspots = [
  { id: "Cau1", name: "Cầu số 1", pollution: 42, note: "Rác nổi sau mưa" },
  { id: "Cau2", name: "Cầu số 2", pollution: 73, note: "Mùi hôi, nước đục" },
  { id: "Cong3", name: "Cống số 3", pollution: 15, note: "Ổn định" },
];

const defaultEvents = [
  { id: cryptoRandomId(), name: "Chủ nhật xanh 07/09", date: nextSunday(), attendees: [], pointsPerAttend: 20, description: "Nhặt rác hai bờ kênh, phân loại tại chỗ" },
];

const defaultPeople = [
  { id: "sv01", name: "Nguyễn Minh Anh", points: 40 },
  { id: "sv02", name: "Trần Bảo", points: 15 },
];

const defaultRewards = [
  { id: "rw01", name: "Bình nước tái sử dụng", cost: 50 },
  { id: "rw02", name: "Áo thun tình nguyện", cost: 120 },
  { id: "rw03", name: "Móc khóa xanh", cost: 20 },
];

const defaultAlerts = {
  badWeatherRisk: false,
  weatherNote: "",
  trashHistory: seedTrashHistory(),
};

function cryptoRandomId() {
  const bytes = typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(8)) : new Uint8Array([Date.now() % 255]);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

function nextSunday() {
  const d = new Date();
  const day = d.getDay();
  const diff = (7 - day) % 7; // days to next Sunday (0=Sun)
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function seedTrashHistory() {
  const today = new Date();
  const arr = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    arr.push({ date: d.toISOString().slice(5, 10), bags: Math.floor(10 + Math.random() * 40), rainfall: Math.random() < 0.35 ? Math.floor(5 + Math.random() * 60) : 0 });
  }
  return arr;
}

function loadOrDefault(key, def) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return def;
    return JSON.parse(raw);
  } catch (e) {
    return def;
  }
}

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function levelToColor(level) {
  // 0-20 xanh, 21-50 vàng, 51-80 cam, 81-100 đỏ
  if (level <= 20) return "bg-green-500";
  if (level <= 50) return "bg-yellow-500";
  if (level <= 80) return "bg-orange-500";
  return "bg-red-600";
}

function levelToLabel(level) {
  if (level <= 20) return "Tốt";
  if (level <= 50) return "Cần chú ý";
  if (level <= 80) return "Xấu";
  return "Nguy hại";
}

// ----------------------- main app -----------------------
export default function KRVTEnviroApp() {
  const [hotspots, setHotspots] = useState(() => loadOrDefault(LS_KEYS.hotspots, defaultHotspots));
  const [events, setEvents] = useState(() => loadOrDefault(LS_KEYS.events, defaultEvents));
  const [people, setPeople] = useState(() => loadOrDefault(LS_KEYS.people, defaultPeople));
  const [rewards, setRewards] = useState(() => loadOrDefault(LS_KEYS.rewards, defaultRewards));
  const [alerts, setAlerts] = useState(() => loadOrDefault(LS_KEYS.alerts, defaultAlerts));

  useEffect(() => save(LS_KEYS.hotspots, hotspots), [hotspots]);
  useEffect(() => save(LS_KEYS.events, events), [events]);
  useEffect(() => save(LS_KEYS.people, people), [people]);
  useEffect(() => save(LS_KEYS.rewards, rewards), [rewards]);
  useEffect(() => save(LS_KEYS.alerts, alerts), [alerts]);

  const totalBags = useMemo(() => alerts.trashHistory.reduce((a, b) => a + b.bags, 0), [alerts.trashHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-gray-800">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Kênh Rạch Văn Thánh – Môi trường xanh</h1>
              <p className="text-sm text-gray-500">Cộng đồng – Khoa học – Hành động</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-2xl px-3 py-1">Thử nghiệm</Badge>
            <Button size="sm" className="rounded-2xl">Báo vấn đề</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="handbook" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-emerald-100/50 p-1 rounded-2xl">
            <TabsTrigger value="handbook" className="rounded-xl"><BookOpen className="w-4 h-4 mr-2"/>Sổ tay</TabsTrigger>
            <TabsTrigger value="monitor" className="rounded-xl"><MapPin className="w-4 h-4 mr-2"/>Đo lường</TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl"><CalendarDays className="w-4 h-4 mr-2"/>Sự kiện & Điểm</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-xl"><AlertTriangle className="w-4 h-4 mr-2"/>Cảnh báo & Biểu đồ</TabsTrigger>
          </TabsList>

          <TabsContent value="handbook" className="mt-6">
            <KnowledgeHandbook />
          </TabsContent>

          <TabsContent value="monitor" className="mt-6">
            <PollutionMonitor hotspots={hotspots} setHotspots={setHotspots} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsAndRewards
              events={events}
              setEvents={setEvents}
              people={people}
              setPeople={setPeople}
              rewards={rewards}
              setRewards={setRewards}
            />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <AlertsAndCharts alerts={alerts} setAlerts={setAlerts} totalBags={totalBags} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500 flex flex-wrap items-center gap-3 justify-between">
          <div>© {new Date().getFullYear()} Dự án cộng đồng KRVT</div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Sun className="w-4 h-4"/>Nắng</span>
            <span className="inline-flex items-center gap-1"><Wind className="w-4 h-4"/>Gió nhẹ</span>
            <span className="inline-flex items-center gap-1"><CloudRain className="w-4 h-4"/>Mưa rào chiều</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ----------------------- SỔ TAY -----------------------
function KnowledgeHandbook() {
  const sections = [
    {
      icon: <Leaf className="w-5 h-5"/>,
      title: "Phân loại rác tại nguồn",
      tips: [
        "Hữu cơ: thức ăn thừa, lá cây – ủ làm phân compost.",
        "Tái chế: giấy, nhựa PET/HDPE, kim loại – rửa sạch, làm khô.",
        "Rác nguy hại: pin, bóng đèn, dầu – để riêng, giao điểm thu gom.",
      ],
      cta: "Tải nhãn dán phân loại (PDF)",
    },
    {
      icon: <AlertTriangle className="w-5 h-5"/>,
      title: "Dấu hiệu ô nhiễm cần báo cáo",
      tips: [
        "Nước đổi màu, bọt trắng bất thường, mùi hôi nặng.",
        "Cá chết, vật nuôi bỏ ăn gần bờ kênh.",
        "Sau mưa lớn: rác trôi dạt nhiều, kiểm tra các miệng cống.",
      ],
      cta: "Gửi báo cáo kèm ảnh",
    },
    {
      icon: <BookOpen className="w-5 h-5"/>,
      title: "Hướng dẫn xử lý nhanh",
      tips: [
        "Trang bị găng tay, kẹp rác, giày kín mũi.",
        "Thu gom theo nhóm 3–5 người, bọc kín rác nguy hại.",
        "Cân, ghi chép số bao rác theo vị trí để theo dõi xu hướng.",
      ],
      cta: "Xem checklist an toàn",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {sections.map((s, idx) => (
        <Card key={idx} className="rounded-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-700">{s.icon}<CardTitle>{s.title}</CardTitle></div>
            <CardDescription>KRVT – Hướng dẫn ngắn gọn</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {s.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="rounded-xl">{s.cta}<ChevronRight className="w-4 h-4 ml-2"/></Button>
          </CardFooter>
        </Card>
      ))}

      <Card className="md:col-span-3 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5"/>Mã màu chất lượng môi trường</CardTitle>
          <CardDescription>Thang đánh giá 0–100: càng cao càng ô nhiễm</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-4 gap-3">
          {[{c:"bg-green-500",l:"0–20: Tốt"},{c:"bg-yellow-500",l:"21–50: Cần chú ý"},{c:"bg-orange-500",l:"51–80: Xấu"},{c:"bg-red-600",l:"81–100: Nguy hại"}].map((it,i)=>(
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${it.c}`}></div>
              <div className="text-sm">{it.l}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------------- ĐO LƯỜNG -----------------------
function PollutionMonitor({ hotspots, setHotspots }) {
  const [newSpot, setNewSpot] = useState({ name: "", pollution: 30, note: "" });

  const updateLevel = (id, val) => {
    setHotspots(prev => prev.map(h => h.id === id ? { ...h, pollution: val } : h));
  };
  const removeSpot = (id) => setHotspots(prev => prev.filter(h => h.id !== id));
  const addSpot = () => {
    if (!newSpot.name.trim()) return;
    const spot = { id: cryptoRandomId(), ...newSpot };
    setHotspots(prev => [...prev, spot]);
    setNewSpot({ name: "", pollution: 30, note: "" });
  };

  const avg = Math.round(hotspots.reduce((a, b) => a + Number(b.pollution || 0), 0) / (hotspots.length || 1));

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5"/>Điểm theo dõi</CardTitle>
          <CardDescription>Điều chỉnh mức ô nhiễm để đổi màu theo thang đánh giá</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotspots.map(h => (
            <motion.div key={h.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border">
              <div className="flex-1">
                <div className="font-medium">{h.name}</div>
                <div className="text-xs text-gray-500">{h.note || ""}</div>
              </div>
              <div className="flex items-center gap-3 min-w-[260px]">
                <div className={`w-8 h-8 rounded-xl ${levelToColor(h.pollution)}`} title={levelToLabel(h.pollution)}></div>
                <input type="range" min={0} max={100} value={h.pollution} onChange={e=>updateLevel(h.id, Number(e.target.value))} className="w-40"/>
                <div className="w-12 text-right text-sm font-semibold">{h.pollution}</div>
                <Button variant="ghost" size="icon" onClick={()=>removeSpot(h.id)}><Trash2 className="w-4 h-4"/></Button>
              </div>
            </motion.div>
          ))}
        </CardContent>
        <CardFooter className="flex items-center gap-3">
          <Input placeholder="Tên điểm (vd: Cống 5)" value={newSpot.name} onChange={e=>setNewSpot(s=>({...s,name:e.target.value}))}/>
          <Select value={String(newSpot.pollution)} onValueChange={(v)=>setNewSpot(s=>({...s,pollution:Number(v)}))}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Mức"/></SelectTrigger>
            <SelectContent>
              {[0,10,20,30,40,50,60,70,80,90,100].map(n=> <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Ghi chú" value={newSpot.note} onChange={e=>setNewSpot(s=>({...s,note:e.target.value}))}/>
          <Button onClick={addSpot} className="rounded-xl"><Plus className="w-4 h-4 mr-1"/>Thêm điểm</Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
          <CardDescription>Mức trung bình & phân bố</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${levelToColor(avg)}`}></div>
            <div>
              <div className="text-sm text-gray-500">Mức trung bình</div>
              <div className="text-2xl font-bold">{avg} – {levelToLabel(avg)}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">Số điểm theo dõi: {hotspots.length}</div>
          <div className="text-xs text-gray-400">Gợi ý: tô màu bản đồ khu vực theo điểm gần nhất.</div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------------- SỰ KIỆN & ĐIỂM -----------------------
function EventsAndRewards({ events, setEvents, people, setPeople, rewards, setRewards }) {
  const [evt, setEvt] = useState({ name: "", date: "", description: "", pointsPerAttend: 20 });
  const [person, setPerson] = useState({ id: "", name: "" });
  const [newReward, setNewReward] = useState({ name: "", cost: 30 });

  const addEvent = () => {
    if (!evt.name || !evt.date) return;
    setEvents(prev => [...prev, { id: cryptoRandomId(), ...evt, attendees: [] }]);
    setEvt({ name: "", date: "", description: "", pointsPerAttend: 20 });
  };

  const addPerson = () => {
    if (!person.id || !person.name) return;
    if (people.some(p => p.id === person.id)) return;
    setPeople(prev => [...prev, { ...person, points: 0 }]);
    setPerson({ id: "", name: "" });
  };

  const toggleAttend = (eventId, personId) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const setHas = new Set(e.attendees);
      if (setHas.has(personId)) {
        setHas.delete(personId);
        return { ...e, attendees: Array.from(setHas) };
      } else {
        setHas.add(personId);
        return { ...e, attendees: Array.from(setHas) };
      }
    }));
  };

  const awardPoints = (eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    setPeople(prev => prev.map(p => ev.attendees.includes(p.id) ? { ...p, points: (p.points || 0) + Number(ev.pointsPerAttend || 0) } : p));
  };

  const addReward = () => {
    if (!newReward.name || !newReward.cost) return;
    setRewards(prev => [...prev, { id: cryptoRandomId(), ...newReward }]);
    setNewReward({ name: "", cost: 30 });
  };

  const redeem = (personId, rewardId) => {
    const person = people.find(p => p.id === personId);
    const reward = rewards.find(r => r.id === rewardId);
    if (!person || !reward) return;
    if ((person.points || 0) < reward.cost) return alert("Không đủ điểm");
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, points: p.points - reward.cost } : p));
    alert(`Đổi quà thành công: ${reward.name}`);
  };

  const leaderboard = [...people].sort((a,b)=> (b.points||0)-(a.points||0)).slice(0,10);

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5"/>Tạo & quản lý sự kiện</CardTitle>
          <CardDescription>Điểm danh – Xếp hạng – Thưởng điểm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-3">
            <Input placeholder="Tên sự kiện" value={evt.name} onChange={e=>setEvt(s=>({...s,name:e.target.value}))}/>
            <Input type="date" value={evt.date} onChange={e=>setEvt(s=>({...s,date:e.target.value}))}/>
            <Input type="number" min={0} placeholder="Điểm/ người" value={evt.pointsPerAttend} onChange={e=>setEvt(s=>({...s,pointsPerAttend:Number(e.target.value)}))}/>
            <Button onClick={addEvent} className="rounded-xl"><Plus className="w-4 h-4 mr-1"/>Thêm sự kiện</Button>
          </div>
          <Textarea placeholder="Mô tả" value={evt.description} onChange={e=>setEvt(s=>({...s,description:e.target.value}))}/>

          <div className="space-y-4">
            {events.map(ev => (
              <div key={ev.id} className="p-4 border rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-lg">{ev.name}</div>
                    <div className="text-sm text-gray-500">Ngày: {ev.date} · +{ev.pointsPerAttend} điểm/ người</div>
                    <div className="text-sm">{ev.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={()=>awardPoints(ev.id)} className="rounded-xl"><Trophy className="w-4 h-4 mr-1"/>Cộng điểm</Button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2"><Users className="w-4 h-4"/>Điểm danh</div>
                  <div className="grid md:grid-cols-3 gap-2">
                    {people.map(p => {
                      const checked = ev.attendees.includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center justify-between gap-3 p-2 rounded-lg border cursor-pointer ${checked?"bg-emerald-100 border-emerald-300":""}`}>
                          <span className="text-sm">{p.name} <span className="text-xs text-gray-500">({p.id})</span></span>
                          <Switch checked={checked} onCheckedChange={()=>toggleAttend(ev.id,p.id)}/>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/>Thành viên</CardTitle>
            <CardDescription>Thêm sinh viên/ tình nguyện viên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Mã (vd: sv03)" value={person.id} onChange={e=>setPerson(s=>({...s,id:e.target.value}))}/>
              <Input placeholder="Họ tên" value={person.name} onChange={e=>setPerson(s=>({...s,name:e.target.value}))}/>
              <Button onClick={addPerson} className="rounded-xl"><Plus className="w-4 h-4 mr-1"/>Thêm</Button>
            </div>
            <div className="text-xs text-gray-500">Lưu ý: Mỗi mã là duy nhất để tính điểm.</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5"/>Bảng xếp hạng</CardTitle>
            <CardDescription>Top 10 theo tổng điểm</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {leaderboard.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center">{i+1}</Badge>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-gray-500">({p.id})</span>
                  </div>
                  <div className="font-semibold">{p.points} điểm</div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5"/>Đổi quà</CardTitle>
            <CardDescription>Tạo quà tặng & đổi điểm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Tên quà" value={newReward.name} onChange={e=>setNewReward(s=>({...s,name:e.target.value}))}/>
              <Input type="number" min={1} placeholder="Điểm" value={newReward.cost} onChange={e=>setNewReward(s=>({...s,cost:Number(e.target.value)}))}/>
              <Button onClick={addReward} className="rounded-xl"><Plus className="w-4 h-4 mr-1"/>Thêm</Button>
            </div>
            <div className="space-y-2">
              {rewards.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>{r.name} <span className="text-sm text-gray-500">– {r.cost} điểm</span></div>
                  <Select onValueChange={(pid)=>redeem(pid, r.id)}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Chọn người đổi"/></SelectTrigger>
                    <SelectContent>
                      {people.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.points}đ)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ----------------------- CẢNH BÁO & BIỂU ĐỒ -----------------------
function AlertsAndCharts({ alerts, setAlerts, totalBags }) {
  const [risk, setRisk] = useState(alerts.badWeatherRisk);
  const [note, setNote] = useState(alerts.weatherNote || "");

  useEffect(() => {
    setAlerts(prev => ({ ...prev, badWeatherRisk: risk, weatherNote: note }));
  }, [risk, note]);

  const pushRandom = () => {
    setAlerts(prev => ({
      ...prev,
      trashHistory: [...prev.trashHistory, { date: new Date().toISOString().slice(5,10), bags: Math.floor(10 + Math.random()*40), rainfall: Math.random() < 0.5 ? Math.floor(5 + Math.random()*60) : 0 }].slice(-15)
    }));
  };

  const riskBadge = risk ? (
    <Badge className="bg-red-600 hover:bg-red-600">Cảnh báo thời tiết xấu</Badge>
  ) : (
    <Badge className="bg-emerald-600 hover:bg-emerald-600">Thời tiết ổn định</Badge>
  );

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5"/>Biểu đồ lượng rác thu gom</CardTitle>
          <CardDescription>Tổng {totalBags} bao trong 15 ngày gần đây</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alerts.trashHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bags" name="Bao rác" />
              <Bar dataKey="rainfall" name="Lượng mưa (mm)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter>
          <Button onClick={pushRandom} variant="secondary" className="rounded-xl">Thêm ngày giả lập</Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CloudRain className="w-5 h-5"/>Cảnh báo thời tiết</CardTitle>
          <CardDescription>Kích hoạt khi dự báo mưa lớn, triều cường</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border">
            <div>
              <div className="font-medium">{risk ? "Nguy cơ rác trôi xuống kênh" : "Mức nguy cơ thấp"}</div>
              <div className="text-sm text-gray-500">Bật để hiển thị cảnh báo trong toàn hệ thống</div>
            </div>
            <Switch checked={risk} onCheckedChange={setRisk}/>
          </div>
          <Textarea placeholder="Ghi chú (vd: mưa lớn 50mm, gió mùa)" value={note} onChange={e=>setNote(e.target.value)} />
          <div className="text-xs text-gray-500">Gợi ý: kết nối API thời tiết trong tương lai để tự động bật cảnh báo.</div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5"/>Ngưỡng cảnh báo theo màu</CardTitle>
          <CardDescription>Khuyến nghị hành động theo từng mức</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3 text-sm">
          {[{c:"bg-green-500",t:"Tốt",a:["Duy trì dọn rác định kỳ","Truyền thông nhắc phân loại"]},{c:"bg-yellow-500",t:"Cần chú ý",a:["Tăng tần suất kiểm tra","Bố trí thùng rác bổ sung"]},{c:"bg-orange-500",t:"Xấu",a:["Huy động nhóm phản ứng nhanh","Lắp lưới chắn rác tạm thời"]},{c:"bg-red-600",t:"Nguy hại",a:["Cảnh báo cộng đồng","Báo chính quyền & tạm ngừng hoạt động gần bờ"]}].map((k,i)=>(
            <div key={i} className="p-3 border rounded-xl">
              <div className="flex items-center gap-2 mb-2"><div className={`w-4 h-4 rounded ${k.c}`}></div><div className="font-semibold">{k.t}</div></div>
              <ul className="list-disc pl-5 space-y-1">
                {k.a.map((it,idx)=>(<li key={idx}>{it}</li>))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
