import React, { useState, useEffect } from 'react';
import { User, Mail } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Modal from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';

const AccountModal = ({ isOpen, onClose }) => {
  const { t, user, updateProfile } = useApp();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
    }
  }, [user, isOpen]);
  
  const handleSave = async () => {
    setSaving(true);
    
    try {
      await updateProfile({ name: name.trim() });
      onClose(); // Закрываем после успешного сохранения
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.account}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t.cancel}
          </Button>
          <Button onClick={handleSave} loading={saving} className="flex-1">
            {t.save}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">
              {(name || user.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Name */}
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label={t.name}
          icon={User}
          placeholder={t.namePlaceholder}
        />
        
        {/* Email (read-only) */}
        <div>
          <label className="block text-slate-400 text-sm mb-2">{t.email}</label>
          <div className="flex items-center gap-3 bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-3">
            <Mail className="w-5 h-5 text-slate-500" />
            <span className="text-slate-300">{user.email}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AccountModal;
