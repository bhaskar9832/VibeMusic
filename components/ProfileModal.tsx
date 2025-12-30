import React, { useState, useRef } from 'react';
import { AuthUser } from '../types';
import { X, Camera, Save, User, Mail, FileText } from 'lucide-react';

interface ProfileModalProps {
  user: AuthUser;
  onClose: () => void;
  onUpdate: (user: AuthUser) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const updatedUser: AuthUser = {
      ...user,
      name,
      bio,
      photoUrl
    };

    onUpdate(updatedUser);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-700 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-8">
          {/* Avatar Upload */}
          <div className="relative -mt-16 mb-6 flex justify-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                <img src={photoUrl || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full text-white hover:bg-cyan-400 transition-colors shadow-lg border-2 border-slate-900"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange} 
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-6">Edit Profile</h2>

          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider flex items-center gap-1">
                <User size={12} /> Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Email (Read Only - Optional for guest) */}
            {user.email && (
              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider flex items-center gap-1">
                  <Mail size={12} /> Email
                </label>
                <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed">
                  {user.email}
                </div>
              </div>
            )}

            {/* Bio Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider flex items-center gap-1">
                <FileText size={12} /> Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us your vibe..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
