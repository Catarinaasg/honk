1'use client';
2
3import React, { useState, useEffect } from 'react';
4import { Bell, BellOff, Car, LogOut, Mail, Plus, Megaphone } from 'lucide-react';
5
6const appState = {
7  users: [],
8  vehicles: [],
9  honks: [],
10  magicLinks: []
11};
12
13export default function Home() {
14  const [currentView, setCurrentView] = useState('landing');
15  const [activePage, setActivePage] = useState('honk');
16  const [currentUser, setCurrentUser] = useState(null);
17  const [email, setEmail] = useState('');
18  const [magicLinkSent, setMagicLinkSent] = useState(false);
19  const [demoMagicLink, setDemoMagicLink] = useState('');
20  const [searchPlate, setSearchPlate] = useState('');
21  const [newPlate, setNewPlate] = useState('');
22  const [isHonking, setIsHonking] = useState(false);
23  const [incomingHonks, setIncomingHonks] = useState([]);
24  const [customMinutes, setCustomMinutes] = useState({});
25  const [userVehicles, setUserVehicles] = useState([]);
26  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
27  const [selectedSound, setSelectedSound] = useState('classic');
28  const [audioElement, setAudioElement] = useState(null);
29  const [currentAudio, setCurrentAudio] = useState(null);
30
31  // Preload audio on component mount
32  useEffect(() => {
33    if (typeof window !== 'undefined') {
34      const audio = new Audio();
35      setAudioElement(audio);
36    }
37  }, []);
38
39  const honkSounds = [
40    { id: 'classic', name: 'Car Horn', emoji: '🚗', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/automobile-horn.mp3' },
41    { id: 'beep', name: 'Air Horn', emoji: '✈️', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/air-horn.mp3' },
42    { id: 'alert', name: 'Gangster Horn', emoji: '💪', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/move.mp3' },
43    { id: 'gentle', name: 'Ship Horn', emoji: '🚢', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/ship-horn.mp3' },
44  ];
45
46  const formatPlate = (value) => {
47    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
48    if (cleaned.length <= 2) {
49      return cleaned;
50    } else if (cleaned.length <= 4) {
51      return cleaned.slice(0, 2) + '-' + cleaned.slice(2);
52    } else {
53      return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 6);
54    }
55  };
56
57  const handlePlateInput = (value, setter) => {
58    const formatted = formatPlate(value);
59    setter(formatted);
60  };
61
62  useEffect(() => {
63    if (typeof window !== 'undefined') {
64      const urlParams = new URLSearchParams(window.location.search);
65      const token = urlParams.get('token');
66      if (token) {
67        handleMagicLinkLogin(token);
68      }
69    }
70  }, []);
71
72  const handleMagicLinkLogin = (token) => {
73    const linkData = appState.magicLinks.find(link => link.token === token);
74    if (linkData) {
75      const user = appState.users.find(u => u.email === linkData.email);
76      if (user) {
77        setCurrentUser(user);
78        loadUserData(user.id);
79        setCurrentView('app');
80        if (typeof window !== 'undefined') {
81          window.history.replaceState({}, '', window.location.pathname);
82        }
83      }
84    }
85  };
86
87  const loadUserData = (userId) => {
88    const vehicles = appState.vehicles.filter(v => v.userId === userId);
89    setUserVehicles(vehicles);
90    const user = appState.users.find(u => u.id === userId);
91    if (user) {
92      setNotificationsEnabled(user.notificationsEnabled);
93      setSelectedSound(user.selectedSound || 'classic');
94    }
95    
96    const receivedHonks = appState.honks.filter(h => h.targetUserId === userId && !h.replied);
97    setIncomingHonks(receivedHonks);
98  };
99
100  const sendMagicLink = (e) => {
101    if (e) e.preventDefault();
102    
103    if (!email || !email.includes('@')) {
104      alert('Please enter a valid email address');
105      return;
106    }
107    
108    let user = appState.users.find(u => u.email === email);
109    if (!user) {
110      user = {
111        id: Date.now().toString(),
112        email: email,
113        notificationsEnabled: false,
114        selectedSound: 'classic',
115        createdAt: new Date()
116      };
117      appState.users.push(user);
118    }
119
120    const token = Math.random().toString(36).substring(2);
121    const magicLink = (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '') + '?token=' + token;
122    
123    appState.magicLinks.push({
124      token: token,
125      email: email,
126      createdAt: new Date()
127    });
128
129    setMagicLinkSent(true);
130    setDemoMagicLink(magicLink);
131  };
132
133  const quickLogin = () => {
134    const user = {
135      id: Date.now().toString(),
136      email: 'demo@honk.app',
137      notificationsEnabled: true,
138      selectedSound: 'classic',
139      createdAt: new Date()
140    };
141    appState.users.push(user);
142    setCurrentUser(user);
143    loadUserData(user.id);
144    setCurrentView('app');
145  };
146
147  const addVehicle = () => {
148    const plate = newPlate.trim();
149    if (!plate) {
150      alert('Please enter a license plate');
151      return;
152    }
153    
154    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
155    
156    const exists = appState.vehicles.find(v => v.plate === normalizedPlate);
157    if (exists) {
158      alert('This license plate is already registered!');
159      return;
160    }
161
162    const vehicle = {
163      id: Date.now().toString(),
164      userId: currentUser.id,
165      plate: normalizedPlate,
166      createdAt: new Date()
167    };
168    
169    appState.vehicles.push(vehicle);
170    setUserVehicles([...userVehicles, vehicle]);
171    setNewPlate('');
172    alert('Vehicle registered successfully!');
173  };
174
175  const toggleNotifications = () => {
176    const newState = !notificationsEnabled;
177    setNotificationsEnabled(newState);
178    
179    const user = appState.users.find(u => u.id === currentUser.id);
180    if (user) {
181      user.notificationsEnabled = newState;
182    }
183  };
184
185  const playSound = (soundId) => {
186    // Stop currently playing audio if any
187    if (currentAudio) {
188      currentAudio.pause();
189      currentAudio.currentTime = 0;
190    }
191
192    const sound = honkSounds.find(s => s.id === soundId);
193    if (sound && sound.url && typeof window !== 'undefined') {
194      // Use existing audio element or create new one
195      const audio = audioElement || new Audio();
196      audio.src = sound.url;
197      audio.volume = 0.7;
198      
199      setCurrentAudio(audio);
200      
201      const playPromise = audio.play();
202      
203      if (playPromise !== undefined) {
204        playPromise
205          .then(() => {
206            console.log('✓ Sound playing:', sound.name);
207          })
208          .catch(err => {
209            console.error('Error playing sound:', err.message);
210            alert('🔊 Sound: ' + sound.name + ' ' + sound.emoji + '\n\nNote: Audio may be blocked. Try opening in new tab or enable autoplay in browser settings.');
211          });
212      }
213
214      // Clear currentAudio when sound finishes
215      audio.onended = () => {
216        setCurrentAudio(null);
217      };
218    }
219  };
220
221  const selectSound = (soundId) => {
222    setSelectedSound(soundId);
223    playSound(soundId);
224    const user = appState.users.find(u => u.id === currentUser.id);
225    if (user) {
226      user.selectedSound = soundId;
227    }
228  };
229
230  const sendQuickReply = (honkId, minutes, customMessage) => {
231    const honk = appState.honks.find(h => h.id === honkId);
232    if (honk) {
233      honk.replied = true;
234      if (customMessage) {
235        honk.replyMessage = customMessage;
236      } else {
237        honk.replyMessage = "I'll be there in " + minutes + " minutes";
238      }
239      honk.replyTime = new Date();
240      
241      setIncomingHonks(incomingHonks.filter(h => h.id !== honkId));
242      
243      const newCustom = Object.assign({}, customMinutes);
244      delete newCustom[honkId];
245      setCustomMinutes(newCustom);
246      
247      alert('✅ Reply sent: ' + honk.replyMessage);
248    }
249  };
250
251  const searchAndHonk = (e) => {
252    if (e) e.preventDefault();
253    
254    const plate = searchPlate.trim();
255    if (!plate) {
256      alert('Please enter a license plate');
257      return;
258    }
259    
260    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
261    
262    const targetVehicle = appState.vehicles.find(v => v.plate === normalizedPlate);
263    
264    if (!targetVehicle) {
265      alert('⚠️ This vehicle is not registered in our system. The owner needs to register their vehicle first!');
266      return;
267    }
268    
269    if (targetVehicle.userId === currentUser.id) {
270      alert("You can't honk at your own vehicle!");
271      return;
272    }
273    
274    const targetUser = appState.users.find(u => u.id === targetVehicle.userId);
275    
276    if (!targetUser || !targetUser.notificationsEnabled) {
277      alert('⚠️ The owner has notifications disabled. They will not receive your honk.');
278      return;
279    }
280    
281    setIsHonking(true);
282    
283    setTimeout(() => {
284      const honk = {
285        id: Date.now().toString(),
286        targetUserId: targetVehicle.userId,
287        targetPlate: targetVehicle.plate,
288        senderUserId: currentUser.id,
289        createdAt: new Date(),
290        replied: false
291      };
292      
293      appState.honks.push(honk);
294      
295      setIsHonking(false);
296      setSearchPlate('');
297      alert('✅ Honk sent successfully! 🔊\nThe vehicle owner will be notified.');
298      
299      if (targetVehicle.userId === currentUser.id) {
300        loadUserData(currentUser.id);
301      }
302    }, 2000);
303  };
304
305  const simulateHonk = () => {
306    if (userVehicles.length === 0) {
307      alert('Add a vehicle first to test the honk feature!');
308      return;
309    }
310    
311    // Play the selected sound
312    playSound(selectedSound);
313    
314    const vehicle = userVehicles[0];
315    const honk = {
316      id: Date.now().toString(),
317      targetUserId: currentUser.id,
318      targetPlate: vehicle.plate,
319      senderUserId: 'test-user',
320      createdAt: new Date(),
321      replied: false
322    };
323    
324    appState.honks.push(honk);
325    setIncomingHonks([...incomingHonks, honk]);
326    
327    // Switch to Alerts tab to show the honk
328    setActivePage('notifications');
329    
330    // Scroll to incoming honks section after switching tabs
331    setTimeout(() => {
332      const incomingSection = document.getElementById('incoming-honks-section');
333      if (incomingSection) {
334        incomingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
335      }
336    }, 100);
337  };
338
339  const logout = () => {
340    setCurrentUser(null);
341    setCurrentView('landing');
342    setActivePage('honk');
343    setEmail('');
344    setMagicLinkSent(false);
345    setDemoMagicLink('');
346    setUserVehicles([]);
347    setIncomingHonks([]);
348  };
349
350  if (currentView === 'landing') {
351    return (
352      <div className="min-h-screen bg-black flex items-center justify-center p-4">
353        <div className="max-w-md w-full">
354          <div className="text-center mb-12">
355            <div className="inline-block bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-4 shadow-2xl mb-8">
356              <Megaphone className="w-12 h-12 text-black" />
357            </div>
358            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-3 tracking-tight">Honk</h1>
359            <p className="text-lg text-gray-400">Digital vehicle notifications</p>
360          </div>
361
362          <div className="bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-800">
363            {!magicLinkSent ? (
364              <>
365                <h2 className="text-2xl font-bold mb-2 text-white">Sign in</h2>
366                <p className="text-gray-400 mb-8">Get started with your email</p>
367                
368                <form onSubmit={sendMagicLink} className="space-y-6">
369                  <div>
370                    <input
371                      type="email"
372                      value={email}
373                      onChange={(e) => setEmail(e.target.value)}
374                      placeholder="Email address"
375                      className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
376                      required
377                    />
378                  </div>
379                  
380                  <button
381                    type="submit"
382                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
383                  >
384                    Continue
385                  </button>
386                </form>
387
388                <div className="relative my-8">
389                  <div className="absolute inset-0 flex items-center">
390                    <div className="w-full border-t border-zinc-800"></div>
391                  </div>
392                  <div className="relative flex justify-center text-sm">
393                    <span className="px-4 bg-zinc-900 text-gray-500">or</span>
394                  </div>
395                </div>
396
397                <button
398                  onClick={quickLogin}
399                  className="w-full bg-zinc-800 text-white py-4 rounded-xl font-bold hover:bg-zinc-700 transition border border-zinc-700"
400                >
401                  Quick demo
402                </button>
403              </>
404            ) : (
405              <div>
406                <div className="text-center mb-8">
407                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
408                    <Mail className="w-8 h-8 text-black" />
409                  </div>
410                  <h2 className="text-2xl font-bold mb-3 text-white">Check your inbox</h2>
411                  <p className="text-gray-400">We sent a link to <span className="text-white font-medium">{email}</span></p>
412                </div>
413                
414                <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-6">
415                  <p className="text-xs text-gray-500 mb-2 font-medium">DEMO LINK</p>
416                  <a 
417                    href={demoMagicLink}
418                    className="text-sm text-cyan-400 break-all hover:text-cyan-300 transition"
419                  >
420                    {demoMagicLink}
421                  </a>
422                </div>
423                
424                <button
425                  onClick={() => {
426                    setMagicLinkSent(false);
427                    setEmail('');
428                    setDemoMagicLink('');
429                  }}
430                  className="w-full text-gray-400 py-3 text-sm hover:text-white transition"
431                >
432                  Use different email
433                </button>
434              </div>
435            )}
436          </div>
437
438          <p className="text-center text-gray-600 text-sm mt-8">
439            Notify vehicle owners instantly
440          </p>
441        </div>
442      </div>
443    );
444  }
445
446  return (
447    <div className="flex flex-col h-screen bg-black">
448      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-4 py-6 flex justify-between items-center">
449        <div className="flex items-center gap-3">
450          <div>
451            <div className="font-bold text-xl tracking-tight">Honk</div>
452            <div className="text-xs opacity-70">{currentUser?.email}</div>
453          </div>
454        </div>
455        <button
456          onClick={logout}
457          className="p-2 hover:bg-black/10 rounded-lg transition"
458        >
459          <LogOut className="w-5 h-5" />
460        </button>
461      </div>
462
463      <div className="flex-1 overflow-y-auto pb-20 bg-black">
464        {activePage === 'honk' && (
465          <div className="p-4">
466            <h2 className="text-3xl font-bold mb-8 text-white tracking-tight">Send honk</h2>
467            
468            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
469              <h3 className="font-semibold mb-4 text-white">License plate</h3>
470              <form onSubmit={searchAndHonk} className="flex flex-col gap-4">
471                <input
472                  type="text"
473                  value={searchPlate}
474                  onChange={(e) => handlePlateInput(e.target.value, setSearchPlate)}
475                  placeholder="XX-XX-XX"
476                  className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl uppercase text-white text-lg font-mono placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition"
477                  maxLength="8"
478                  disabled={isHonking}
479                />
480                <button
481                  type="submit"
482                  disabled={isHonking}
483                  className={'w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ' + 
484                    (isHonking 
485                      ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' 
486                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:shadow-lg hover:shadow-cyan-500/50')}
487                >
488                  <Megaphone className="w-5 h-5" />
489                  {isHonking ? 'Sending...' : 'Send honk'}
490                </button>
491              </form>
492            </div>
493
494            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
495              <h3 className="font-semibold text-white mb-3">How it works</h3>
496              <ol className="text-sm text-gray-400 space-y-2">
497                <li className="flex gap-3"><span className="text-cyan-400 font-bold">1</span>Enter the license plate</li>
498                <li className="flex gap-3"><span className="text-cyan-400 font-bold">2</span>Owner gets notified instantly</li>
499                <li className="flex gap-3"><span className="text-cyan-400 font-bold">3</span>They respond with ETA</li>
500              </ol>
501            </div>
502          </div>
503        )}
504
505        {activePage === 'notifications' && (
506          <div className="p-4">
507            <h2 className="text-3xl font-bold mb-8 text-white tracking-tight">Alerts</h2>
508            
509            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
510              <div className="flex items-center justify-between">
511                <div className="flex items-center gap-4">
512                  {notificationsEnabled ? (
513                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
514                      <Bell className="w-6 h-6 text-black" />
515                    </div>
516                  ) : (
517                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
518                      <BellOff className="w-6 h-6 text-gray-500" />
519                    </div>
520                  )}
521                  <div>
522                    <div className="font-semibold text-white">Receive honks</div>
523                    <div className="text-sm text-gray-400">Get notified instantly</div>
524                  </div>
525                </div>
526                <button
527                  onClick={toggleNotifications}
528                  className={'w-14 h-8 rounded-full transition relative ' + (notificationsEnabled ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-zinc-800')}
529                >
530                  <div className={'w-6 h-6 bg-white rounded-full transition-all absolute top-1 ' + (notificationsEnabled ? 'right-1' : 'left-1')}></div>
531                </button>
532              </div>
533            </div>
534
535            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
536              <h3 className="font-semibold text-white mb-2">Notification sound</h3>
537              <p className="text-sm text-gray-400 mb-6">Choose your alert tone</p>
538              
539              <div className="space-y-3">
540                {honkSounds.map(sound => (
541                  <div 
542                    key={sound.id}
543                    className={'flex items-center justify-between p-4 rounded-xl transition cursor-pointer border ' + 
544                      (selectedSound === sound.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-zinc-800 bg-black hover:border-zinc-700')}
545                    onClick={() => selectSound(sound.id)}
546                  >
547                    <div className="flex items-center gap-3">
548                      <div className="text-2xl">{sound.emoji}</div>
549                      <div>
550                        <div className="font-medium text-white">{sound.name}</div>
551                      </div>
552                    </div>
553                    {selectedSound === sound.id && (
554                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
555                        <div className="text-black text-xs font-bold">✓</div>
556                      </div>
557                    )}
558                  </div>
559                ))}
560              </div>
561            </div>
562
563            <div className="space-y-3" id="incoming-honks-section">
564              <h3 className="font-semibold text-lg text-white mb-4">Incoming honks</h3>
565              
566              {incomingHonks.length > 0 ? (
567                incomingHonks.map(honk => (
568                  <div key={honk.id} className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-3xl p-6">
569                    <div className="mb-4">
570                      <div className="font-bold text-white mb-2">Someone is honking!</div>
571                      <div className="text-sm text-gray-400">Vehicle: <span className="text-white font-mono">{honk.targetPlate}</span></div>
572                    </div>
573                    
574                    <div className="space-y-3">
575                      <div className="text-sm font-medium text-gray-300">Response time</div>
576                      <div className="grid grid-cols-3 gap-2">
577                        <button
578                          onClick={() => sendQuickReply(honk.id, 2)}
579                          className="bg-black border border-zinc-800 rounded-xl py-3 text-center hover:border-cyan-400 transition"
580                        >
581                          <div className="text-xs text-gray-400">I'll be there in</div>
582                          <div className="text-lg font-bold text-white">2 min</div>
583                        </button>
584                        <button
585                          onClick={() => sendQuickReply(honk.id, 5)}
586                          className="bg-black border border-zinc-800 rounded-xl py-3 text-center hover:border-cyan-400 transition"
587                        >
588                          <div className="text-xs text-gray-400">I'll be there in</div>
589                          <div className="text-lg font-bold text-white">5 min</div>
590                        </button>
591                        <button
592                          onClick={() => sendQuickReply(honk.id, 10)}
593                          className="bg-black border border-zinc-800 rounded-xl py-3 text-center hover:border-cyan-400 transition"
594                        >
595                          <div className="text-xs text-gray-400">I'll be there in</div>
596                          <div className="text-lg font-bold text-white">10 min</div>
597                        </button>
598                      </div>
599                      
600                      <button
601                        onClick={() => sendQuickReply(honk.id, null, "I moved the vehicle already")}
602                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl py-3 font-bold text-black hover:shadow-lg hover:shadow-green-500/50 transition"
603                      >
604                        Already moved
605                      </button>
606                    </div>
607                  </div>
608                ))
609              ) : (
610                <div className="text-center py-16 bg-zinc-900 rounded-3xl border border-zinc-800">
611                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
612                    <Bell className="w-8 h-8 text-gray-600" />
613                  </div>
614                  <p className="text-gray-500">No honks yet</p>
615                </div>
616              )}
617            </div>
618          </div>
619        )}
620
621        {activePage === 'vehicles' && (
622          <div className="p-4">
623            <div className="flex items-center justify-between mb-8">
624              <h2 className="text-3xl font-bold text-white tracking-tight">Vehicles</h2>
625              <button onClick={simulateHonk} className="text-xs text-gray-400 border border-zinc-800 rounded-lg px-3 py-1.5 hover:border-cyan-400 hover:text-cyan-400 transition">
626                Test honk
627              </button>
628            </div>
629
630            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
631              <h3 className="font-semibold mb-4 text-white">Add vehicle</h3>
632              <div className="flex flex-col gap-4">
633                <input
634                  type="text"
635                  value={newPlate}
636                  onChange={(e) => handlePlateInput(e.target.value, setNewPlate)}
637                  onKeyPress={(e) => e.key === 'Enter' && addVehicle()}
638                  placeholder="XX-XX-XX"
639                  className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl uppercase text-white text-lg font-mono placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition"
640                  maxLength="8"
641                />
642                <button
643                  onClick={addVehicle}
644                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2 transition-all"
645                >
646                  <Plus className="w-5 h-5" />
647                  Add vehicle
648                </button>
649              </div>
650            </div>
651
652            <div className="space-y-3">
653              {userVehicles.length > 0 ? (
654                userVehicles.map(vehicle => (
655                  <div key={vehicle.id} className="bg-zinc-900 rounded-3xl p-6 flex items-center gap-4 border border-zinc-800">
656                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
657                      <Car className="w-7 h-7 text-black" />
658                    </div>
659                    <div>
660                      <div className="font-mono text-2xl font-bold text-white">{vehicle.plate}</div>
661                      <div className="text-sm text-gray-400">Registered</div>
662                    </div>
663                  </div>
664                ))
665              ) : (
666                <div className="text-center py-16 bg-zinc-900 rounded-3xl border border-zinc-800">
667                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
668                    <Car className="w-8 h-8 text-gray-600" />
669                  </div>
670                  <p className="text-gray-500">No vehicles yet</p>
671                </div>
672              )}
673            </div>
674          </div>
675        )}
676      </div>
677
678      <div className="bg-zinc-900 border-t border-zinc-800 px-2 py-3 flex justify-around">
679        <button
680          onClick={() => setActivePage('honk')}
681          className={'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition ' + (activePage === 'honk' ? 'bg-cyan-400/10' : '')}
682        >
683          <Megaphone className={'w-6 h-6 transition ' + (activePage === 'honk' ? 'text-cyan-400' : 'text-gray-600')} />
684          <span className={'text-xs font-medium transition ' + (activePage === 'honk' ? 'text-cyan-400' : 'text-gray-600')}>Honk</span>
685        </button>
686        
687        <button
688          onClick={() => setActivePage('notifications')}
689          className={'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl relative transition ' + (activePage === 'notifications' ? 'bg-cyan-400/10' : '')}
690        >
691          {incomingHonks.length > 0 && (
692            <div className="absolute top-1 right-1/4 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border-2 border-zinc-900"></div>
693          )}
694          {notificationsEnabled ? (
695            <Bell className={'w-6 h-6 transition ' + (activePage === 'notifications' ? 'text-cyan-400' : 'text-gray-600')} />
696          ) : (
697            <BellOff className={'w-6 h-6 transition ' + (activePage === 'notifications' ? 'text-cyan-400' : 'text-gray-600')} />
698          )}
699          <span className={'text-xs font-medium transition ' + (activePage === 'notifications' ? 'text-cyan-400' : 'text-gray-600')}>Alerts</span>
700        </button>
701        
702        <button
703          onClick={() => setActivePage('vehicles')}
704          className={'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition ' + (activePage === 'vehicles' ? 'bg-cyan-400/10' : '')}
705        >
706          <Car className={'w-6 h-6 transition ' + (activePage === 'vehicles' ? 'text-cyan-400' : 'text-gray-600')} />
707          <span className={'text-xs font-medium transition ' + (activePage === 'vehicles' ? 'text-cyan-400' : 'text-gray-600')}>Vehicles</span>
708        </button>
709      </div>
710    </div>
711  );
712}
713
