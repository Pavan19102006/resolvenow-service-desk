import React, { useState } from 'react';
import {
  X,
  Layers,
  Server,
  Database,
  Shield,
  Bell,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { getBaseUrl } from '../services/api';

export default function ArchitectureModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const baseUrl = getBaseUrl();

  if (!isOpen) return null;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const services = [
    {
      name: 'API Gateway',
      port: '8080 (Local) / 10000 (Render)',
      role: 'Unified Ingress, JWT Validation, Load Balancing, Global CORS',
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20'
    },
    {
      name: 'Eureka Discovery',
      port: '8761',
      role: 'Dynamic microservice registration and heartbeat health monitoring',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20'
    },
    {
      name: 'Auth Service',
      port: '8081',
      role: 'BCrypt password hashing, JWT minting & token validation',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/20'
    },
    {
      name: 'Complaint Service',
      port: '8082',
      role: 'Ticket lifecycle, status transitions, PostgreSQL persistence',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20'
    },
    {
      name: 'Assignment Service',
      port: '8083',
      role: 'Algorithmic routing to ESCALATION, GENERAL_SUPPORT, SELF_SERVICE',
      color: 'text-violet-400',
      bg: 'bg-violet-400/10 border-violet-400/20'
    },
    {
      name: 'Notification Service',
      port: '8084',
      role: 'Dispatches multi-channel alerts upon ticket status updates',
      color: 'text-rose-400',
      bg: 'bg-rose-400/10 border-rose-400/20'
    }
  ];

  const endpoints = [
    {
      title: '1. Register User',
      curl: `curl -X POST ${baseUrl}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"john","password":"pass123","email":"john@example.com","role":"USER"}'`
    },
    {
      title: '2. Login & Mint JWT',
      curl: `curl -X POST ${baseUrl}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"john","password":"pass123"}'`
    },
    {
      title: '3. Lodge Grievance',
      curl: `curl -X POST ${baseUrl}/complaints \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{"title":"Network latency spike","description":"Latency over 300ms","category":"TECHNICAL","priority":"HIGH"}'`
    },
    {
      title: '4. Update Ticket Status',
      curl: `curl -X PUT "${baseUrl}/complaints/1/status?status=RESOLVED" \\
  -H "Authorization: Bearer <TOKEN>"`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl rounded-xl bg-[#18181B] border border-[#27272A] p-6 shadow-2xl text-[#FAFAFA] animate-fade-in space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FAFAFA]">
                  System Architecture & Endpoints
                </h3>
                <p className="text-xs text-[#71717A]">
                  Spring Boot 3.2.0 • Spring Cloud Gateway • Netflix Eureka • PostgreSQL
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Microservices Grid */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block">
              Discovered Microservices
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((svc) => (
                <div
                  key={svc.name}
                  className="p-3 rounded-lg bg-[#111113] border border-[#27272A] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${svc.color}`}>{svc.name}</span>
                    <span className="font-mono text-[10px] text-[#71717A]">{svc.port}</span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                    {svc.role}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoints & cURL Cheatsheet */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block">
              REST Client / cURL Verification Commands
            </span>
            <div className="space-y-2">
              {endpoints.map((ep, idx) => (
                <div
                  key={ep.title}
                  className="rounded-lg bg-[#111113] border border-[#27272A] p-3 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-[#FAFAFA]">{ep.title}</span>
                    <button
                      onClick={() => copyToClipboard(ep.curl, idx)}
                      className="text-[11px] text-[#71717A] hover:text-[#8B5CF6] flex items-center space-x-1 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-[10px] text-[#A1A1AA] overflow-x-auto p-2 rounded bg-[#09090B] border border-[#27272A]">
                    {ep.curl}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
