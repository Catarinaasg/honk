'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Car, LogOut, Mail, Plus, Megaphone } from 'lucide-react';

const appState = {
  users: [],
  vehicles: [],
  honks: [],
  magicLinks: []
};

export default function Home() {
  const [currentView, setCurrentView] = useState('landing');
  const [activePage, setActivePage] = useState('honk');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [demoMagicLink, setDemoMagicLink] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [isHonking, setIsHonking] = useState(false);
  const [incomingHonks, setIncomingHonks] = useState([]);
  const [customMinutes, setCustomMinutes] = useState({});
  const [userVehicles, setUserVehicles] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedSound, setSelectedSound] = useState('classic');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Preload audio on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      setAudioElement(audio);
    }
  }, []);

  const honkSounds = [
    { id: 'classic', name: 'Car Horn', emoji: '🚗', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/automobile-horn.mp3' },
    { id: 'beep', name: 'Air Horn', emoji: '✈️', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/air-horn.mp3' },
    { id: 'alert', name: 'Gangster Horn', emoji: '💪', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/move.mp3' },
    { id: 'gentle', name: 'Ship Horn', emoji: '🚢', url: 'https://raw.githubusercontent.com/catarinaasg/honk/main/sounds/ship-horn.mp3' },
  ];

  const formatPlate = (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    } else {
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 6);
    }
  };

  const handlePlateInput = (value, setter) => {
    const formatted = formatPlate(value);
    setter(formatted);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        handleMagicLinkLogin(token);
      }
    }
  }, []);

  const handleMagicLinkLogin = (token) => {
    const linkData = appState.magicLinks.find(link => link.token === token);
    if (linkData) {
      const user = appState.users.find(u => u.email === linkData.email);
      if (user) {
        setCurrentUser(user);
        loadUserData(user.id);
        setCurrentView('app');
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  };

  const loadUserData = (userId) => {
    const vehicles = appState.vehicles.filter(v => v.userId === userId);
    setUserVehicles(vehicles);
    const user = appState.users.find(u => u.id === userId);
    if (user) {
      setNotificationsEnabled(user.notificationsEnabled);
      setSelectedSound(user.selectedSound || 'classic');
    }
    
    const receivedHonks = appState.honks.filter(h => h.targetUserId === userId && !h.replied);
    setIncomingHonks(receivedHonks);
  };

  const sendMagicLink = (e) => {
    if (e) e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    let user = appState.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: Date.now().toString(),
        email: email,
        notificationsEnabled: false,
        selectedSound: 'classic',
        createdAt: new Date()
      };
      appState.users.push(user);
    }

    const token = Math.random().toString(36).substring(2);
    const magicLink = (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '') + '?token=' + token;
    
    appState.magicLinks.push({
      token: token,
      email: email,
      createdAt: new Date()
    });

    setMagicLinkSent(true);
    setDemoMagicLink(magicLink);
  };

  const quickLogin = () => {
    const user = {
      id: Date.now().toString(),
      email: 'demo@honk.app',
      notificationsEnabled: true,
      selectedSound: 'classic',
      createdAt: new Date()
    };
    appState.users.push(user);
    setCurrentUser(user);
    loadUserData(user.id);
    setCurrentView('app');
  };

  const addVehicle = () => {
    const plate = newPlate.trim();
    if (!plate) {
      alert('Please enter a license plate');
      return;
    }
    
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    const exists = appState.vehicles.find(v => v.plate === normalizedPlate);
    if (exists) {
      alert('This license plate is already registered!');
      return;
    }

    const vehicle = {
      id: Date.now().toString(),
      userId: currentUser.id,
      plate: normalizedPlate,
      createdAt: new Date()
    };
    
    appState.vehicles.push(vehicle);
    setUserVehicles([...userVehicles, vehicle]);
    setNewPlate('');
    alert('Vehicle registered successfully!');
  };

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    const user = appState.users.find(u => u.id === currentUser.id);
    if (user) {
      user.notificationsEnabled = newState;
    }
  };

  const playSound = (soundId) => {
    // Stop currently playing audio if any
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const sound = honkSounds.find(s => s.id === soundId);
    if (sound && sound.url && typeof window !== 'undefined') {
      // Use existing audio element or create new one
      const audio = audioElement || new Audio();
      audio.src = sound.url;
      audio.volume = 0.7;
      
      setCurrentAudio(audio);
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✓ Sound playing:', sound.name);
          })
          .catch(err => {
            console.error('Error playing sound:', err.message);
            alert('🔊 Sound: ' + sound.name + ' ' + sound.emoji + '\n\nNote: Audio may be blocked. Try opening in new tab or enable autoplay in browser settings.');
          });
      }

      // Clear currentAudio when sound finishes
      audio.onended = () => {
        setCurrentAudio(null);
      };
    }
  };

  const selectSound = (soundId) => {
    setSelectedSound(soundId);
    playSound(soundId);
    const user = appState.users.find(u => u.id === currentUser.id);
    if (user) {
      user.selectedSound = soundId;
    }
  };

  const sendQuickReply = (honkId, minutes, customMessage) => {
    const honk = appState.honks.find(h => h.id === honkId);
    if (honk) {
      honk.replied = true;
      if (customMessage) {
        honk.replyMessage = customMessage;
      } else {
        honk.replyMessage = "I'll be there in " + minutes + " minutes";
      }
      honk.replyTime = new Date();
      
      setIncomingHonks(incomingHonks.filter(h => h.id !== honkId));
      
      const newCustom = Object.assign({}, customMinutes);
      delete newCustom[honkId];
      setCustomMinutes(newCustom);
      
      alert('✅ Reply sent: ' + honk.replyMessage);
    }
  };

  const searchAndHonk = (e) => {
    if (e) e.preventDefault();
    
    const plate = searchPlate.trim();
    if (!plate) {
      alert('Please enter a license plate');
      return;
    }
    
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    const targetVehicle = appState.vehicles.find(v => v.plate === normalizedPlate);
    
    if (!targetVehicle) {
      alert('⚠️ This vehicle is not registered in our system. The owner needs to register their vehicle first!');
      return;
    }
    
    if (targetVehicle.userId === currentUser.id) {
      alert("You can't honk at your own vehicle!");
      return;
    }
    
    const targetUser = appState.users.find(u => u.id === targetVehicle.userId);
    
    if (!targetUser || !targetUser.notificationsEnabled) {
      alert('⚠️ The owner has notifications disabled. They will not receive your honk.');
      return;
    }
    
    setIsHonking(true);
    
    setTimeout(() => {
      const honk = {
        id: Date.now().toString(),
        targetUserId: targetVehicle.userId,
        targetPlate: targetVehicle.plate,
        senderUserId: currentUser.id,
        createdAt: new Date(),
        replied: false
      };
      
      appState.honks.push(honk);
      
      setIsHonking(false);
      setSearchPlate('');
      alert('✅ Honk sent successfully! 🔊\nThe vehicle owner will be notified.');
      
      if (targetVehicle.userId === currentUser.id) {
        loadUserData(currentUser.id);
      }
    }, 2000);
  };

  const simulateHonk = () => {
    if (userVehicles.length === 0) {
      alert('Add a vehicle first to test the honk feature!');
      return;
    }
    
    // Play the selected sound
    playSound(selectedSound);
    
    const vehicle = userVehicles[0];
    const honk = {
      id: Date.now().toString(),
      targetUserId: currentUser.id,
      targetPlate: vehicle.plate,
      senderUserId: 'test-user',
      createdAt: new Date(),
      replied: false
    };
    
    appState.honks.push(honk);
    setIncomingHonks([...incomingHonks, honk]);
    
    // Switch to Alerts tab to show the honk
    setActivePage('notifications');
    
    // Scroll to incoming honks section after switching tabs
    setTimeout(() => {
      const incomingSection = document.getElementById('incoming-honks-section');
      if (incomingSection) {
        incomingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setActivePage('honk');
    setEmail('');
    setMagicLinkSent(false);
    setDemoMagicLink('');
    setUserVehicles([]);
    setIncomingHonks([]);
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-4 shadow-2xl mb-8">
              <Megaphone className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-3 tracking-tight">Honk</h1>
            <p className="text-lg text-gray-400">Digital vehicle notifications</p>
          </div>

          <div className="bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-800">
            {!magicLinkSent ? (
              <>
                <h2 className="text-2xl font-bold mb-2 text-white">Sign in</h2>
                <p className="text-gray-400 mb-8">Get started with your email</p>
                
                <form onSubmit={sendMagicLink} className="space-y-6">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Continue
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-zinc-900 text-gray-500">or</span>
                  </div>
                </div>

                <button
                  onClick={quickLogin}
                  className="w-full bg-zinc-800 text-white py-4 rounded-xl font-bold hover:bg-zinc-700 transition border border-zinc-700"
                >
                  Quick demo
                </button>
              </>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-white">Check your inbox</h2>
                  <p className="text-gray-400">We sent a link to <span className="text-white font-medium">{email}</span></p>
                </div>
                
                <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2 font-medium">DEMO LINK</p>
                  <a 
                    href={demoMagicLink}
                    className="text-sm text-cyan-400 break-all hover:text-cyan-300 transition"
                  >
                    {demoMagicLink}
                  </a>
                </div>
                
                <button
                  onClick={() => {
                    setMagicLinkSent(false);
                    setEmail('');
                    setDemoMagicLink('');
                  }}
                  className="w-full text-gray-400 py-3 text-sm hover:text-white transition"
                >
                  Use different email
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-gray-600 text-sm mt-8">
            Notify vehicle owners instantly
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold text-xl tracking-tight">Honk</div>
            <div className="text-xs opacity-70">{currentUser?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-black/10 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 bg-black">
        {activePage === 'honk' && (
          <div className="p-4">
            <h2 className="text-3xl font-bold mb-8 text-white tracking-tight">Send honk</h2>
            
            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
              <h3 className="font-semibold mb-4 text-white">License plate</h3>
              <form onSubmit={searchAndHonk} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={searchPlate}
                  onChange={(e) => handlePlateInput(e.target.value, setSearchPlate)}
                  placeholder="XX-XX-XX"
                  className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl uppercase text-white text-lg font-mono placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition"
                  maxLength="8"
                  disabled={isHonking}
                />
                <button
                  type="submit"
                  disabled={isHonking}
                  className={'w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ' + 
                    (isHonking 
                      ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:shadow-lg hover:shadow-cyan-500/50')}
                >
                  <Megaphone className="w-5 h-5" />
                  {isHonking ? 'Sending...' : 'Send honk'}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
              <h3 className="font-semibold text-white mb-3">How it works</h3>
              <ol className="text-sm text-gray-400 space-y-2">
                <li className="flex gap-3"><span className="text-cyan-400 font-bold">1</span>Enter the license plate</li>
                <li className="flex gap-3"><span className="text-cyan-400 font-bold">2</span>Owner gets notified instantly</li>
                <li className="flex gap-3"><span className="text-cyan-400 font-bold">3</span>They respond with ETA</li>
              </ol>
            </div>
          </div>
        )}

        {activePage === 'notifications' && (
          <div className="p-4">
            <h2 className="text-3xl font-bold mb-8 text-white tracking-tight">Alerts</h2>
            
            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {notificationsEnabled ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-black" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                      <BellOff className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">Receive honks</div>
                    <div className="text-sm text-gray-400">Get notified instantly</div>
                  </div>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={'w-14 h-8 rounded-full transition relative ' + (notificationsEnabled ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-zinc-800')}
                >
                  <div className={'w-6 h-6 bg-white rounded-full transition-all absolute top-1 ' + (notificationsEnabled ? 'right-1' : 'left-1')}></div>
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
              <h3 className="font-semibold text-white mb-2">Notification sound</h3>
              <p className="text-sm text-gray-400 mb-6">Choose your alert tone</p>
              
              <div className="space-y-3">
                {honkSounds.map(sound => (
                  <div 
                    key={sound.id}
                    className={'flex items-center justify-between p-4 rounded-xl transition cursor-pointer border ' + 
                      (selectedSound === sound.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-zinc-800 bg-black hover:border-zinc-700')}
                    onClick={() => selectSound(sound.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{sound.emoji}</div>
                      <div>
                        <div className="font-medium text-white">{sound.name}</div>
                      </div>
                    </div>
                    {selectedSound === sound.id && (
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                        <div className="text-black text-xs font-bold">✓</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3" id="incoming-honks-section">
              <h3 className="font-semibold text-lg text-white mb-4">Incoming honks</h3>
              
              {incomingHonks.length > 0 ? (
                incomingHonks.map(honk => (
                  <div key={honk.id} className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-3xl p-6">
                    <div className="mb-4">
                      <div className="font-bold text-white mb-2">Someone is honking!</div>
                      <div className="text-sm text-gray-400">Vehicle: <span className="text-white font-mono">{honk.targetPlate}</span></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-300">Response time</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => sendQuickReply(honk.id, 2)}
                          className="bg-black border border-zinc-800 rounded-xl py-3 text-center hover:border-cyan-400 transition"
                        >
                          <div className="text-xs text-gray-400">I'll be there in</div>
                          <div className="text-lg font-bold text-white">2 min</div>
                        </button>
                        <button
                          onClick={() => sendQuickReply(honk.id, 5)}
                          className="bg-black border border-zinc-800 rounded-xl py-3 text-center hover:border-cyan-400 transition"
                        >
                          <div className="text-xs text-gray-400">I'll be there in</div>
                          <div className="text-lg font-bold text-white">5 min</div>
                        </button>
                        <button
                          onClick={() => sendQuickReply(honk.id, 10)}
                          className="bg-black border border-zinc-800 rounded-xl py-3 text-center hover:border-cyan-400 transition"
                        >
                          <div className="text-xs text-gray-400">I'll be there in</div>
                          <div className="text-lg font-bold text-white">10 min</div>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => sendQuickReply(honk.id, null, "I moved the vehicle already")}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl py-3 font-bold text-black hover:shadow-lg hover:shadow-green-500/50 transition"
                      >
                        Already moved
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-zinc-900 rounded-3xl border border-zinc-800">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">No honks yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activePage === 'vehicles' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight">Vehicles</h2>
              <button onClick={simulateHonk} className="text-xs text-gray-400 border border-zinc-800 rounded-lg px-3 py-1.5 hover:border-cyan-400 hover:text-cyan-400 transition">
                Test honk
              </button>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
              <h3 className="font-semibold mb-4 text-white">Add vehicle</h3>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => handlePlateInput(e.target.value, setNewPlate)}
                  onKeyPress={(e) => e.key === 'Enter' && addVehicle()}
                  placeholder="XX-XX-XX"
                  className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl uppercase text-white text-lg font-mono placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition"
                  maxLength="8"
                />
                <button
                  onClick={addVehicle}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add vehicle
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {userVehicles.length > 0 ? (
                userVehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-zinc-900 rounded-3xl p-6 flex items-center gap-4 border border-zinc-800">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Car className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <div className="font-mono text-2xl font-bold text-white">{vehicle.plate}</div>
                      <div className="text-sm text-gray-400">Registered</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-zinc-900 rounded-3xl border border-zinc-800">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">No vehicles yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border-t border-zinc-800 px-2 py-3 flex justify-around">
        <button
          onClick={() => setActivePage('honk')}
          className={'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition ' + (activePage === 'honk' ? 'bg-cyan-400/10' : '')}
        >
          <Megaphone className={'w-6 h-6 transition ' + (activePage === 'honk' ? 'text-cyan-400' : 'text-gray-600')} />
          <span className={'text-xs font-medium transition ' + (activePage === 'honk' ? 'text-cyan-400' : 'text-gray-600')}>Honk</span>
        </button>
        
        <button
          onClick={() => setActivePage('notifications')}
          className={'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl relative transition ' + (activePage === 'notifications' ? 'bg-cyan-400/10' : '')}
        >
          {incomingHonks.length > 0 && (
            <div className="absolute top-1 right-1/4 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full border-2 border-zinc-900"></div>
          )}
          {notificationsEnabled ? (
            <Bell className={'w-6 h-6 transition ' + (activePage === 'notifications' ? 'text-cyan-400' : 'text-gray-600')} />
          ) : (
            <BellOff className={'w-6 h-6 transition ' + (activePage === 'notifications' ? 'text-cyan-400' : 'text-gray-600')} />
          )}
          <span className={'text-xs font-medium transition ' + (activePage === 'notifications' ? 'text-cyan-400' : 'text-gray-600')}>Alerts</span>
        </button>
        
        <button
          onClick={() => setActivePage('vehicles')}
          className={'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition ' + (activePage === 'vehicles' ? 'bg-cyan-400/10' : '')}
        >
          <Car className={'w-6 h-6 transition ' + (activePage === 'vehicles' ? 'text-cyan-400' : 'text-gray-600')} />
          <span className={'text-xs font-medium transition ' + (activePage === 'vehicles' ? 'text-cyan-400' : 'text-gray-600')}>Vehicles</span>
        </button>
      </div>
    </div>
  );
}
