import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, FileText, Plus, Sparkles, Loader2, CheckCircle2,
  AlertCircle, Home, Layers, Zap, Wrench, Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  processDocumentFile, processDocumentText, applyExtractedToSupabase,
} from '../../lib/documentProcessor';
import { upsertDocument } from '../../lib/supabaseDataStore';

const STAGES = {
  idle: 'Drop a document — Homer will read it and fill in your home profile',
  reading: 'Reading your document...',
  analyzing: 'Homer is analyzing with Claude...',
  extracted: 'Here is what Homer found',
  saving: 'Writing to your home profile...',
  done: 'Home profile updated!',
  error: 'Something went wrong',
};

export default function AddInfoModal({ isOpen, onClose, section, propertyId, onSave }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [docType, setDocType] = useState('appraisal');
  const [stage, setStage] = useState('idle');
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const reset = () => {
    setFile(null); setNotes(''); setStage('idle');
    setExtracted(null); setError(null); setSummary(null);
  };

  const closeAndReset = () => { reset(); onClose(); };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    await runExtraction(f, null);
    try { e.target.value = ''; } catch (_) {}
  };

  const runExtraction = async (fileToProcess, textToProcess) => {
    setStage('analyzing');
    try {
      const result = fileToProcess
        ? await processDocumentFile(fileToProcess, docType, {})
        : await processDocumentText(textToProcess, docType, {});
      if (!result || result.error) {
        throw new Error(result?.error || 'No extraction results');
      }
      setExtracted(result);
      setStage('extracted');
    } catch (err) {
      console.error('Extraction failed:', err);
      setError(err.message || 'Failed to analyze document');
      setStage('error');
    }
  };

  const handleAnalyzeText = async () => {
    if (!notes.trim()) {
      toast.error('Paste some text first');
      return;
    }
    await runExtraction(null, notes);
  };

  const handleApply = async () => {
    if (!extracted || !propertyId) return;
    setStage('saving');
    try {
      const applySummary = await applyExtractedToSupabase(propertyId, extracted);

      // Record the document
      if (file) {
        await upsertDocument({
          property_id: propertyId,
          name: file.name,
          type: docType,
          file_type: file.type || '',
          notes: extracted.summary || '',
        });
      } else if (notes) {
        await upsertDocument({
          property_id: propertyId,
          name: `${docType} (pasted text)`,
          type: docType,
          notes: extracted.summary || notes.slice(0, 200),
        });
      }

      setSummary(applySummary);
      setStage('done');
      if (onSave) await onSave();
      toast.success('Your home profile has been updated!');
    } catch (err) {
      console.error('Apply failed:', err);
      setError(err.message || 'Failed to save');
      setStage('error');
    }
  };

  if (!isOpen) return null;

  const hasResults = stage === 'extracted' || stage === 'saving' || stage === 'done';
  const isProcessing = stage === 'analyzing' || stage === 'saving';
  const isDone = stage === 'done';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={isProcessing ? undefined : closeAndReset}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-hb-teal to-hb-teal-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add to Home Profile</h2>
                <p className="text-xs text-gray-500">{STAGES[stage]}</p>
              </div>
            </div>
            <button
              onClick={closeAndReset}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Initial state: upload / paste */}
            {stage === 'idle' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hb-teal focus:border-transparent outline-none text-sm"
                  >
                    <option value="appraisal">Appraisal</option>
                    <option value="inspection">Home Inspection</option>
                    <option value="disclosure">Seller Disclosure</option>
                    <option value="listing">MLS Listing</option>
                    <option value="warranty">Warranty / Receipt</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload a file
                  </label>
                  <label
                    htmlFor="aim-file-upload"
                    className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-hb-teal hover:bg-hb-teal-50/30 transition-all cursor-pointer"
                  >
                    <input
                      type="file"
                      id="aim-file-upload"
                      accept=".pdf,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Drop a PDF, image, or text file</p>
                    <p className="text-xs text-gray-400 mt-1">Homer will read it and fill in dimensions, rooms, appliances, systems...</p>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 uppercase tracking-widest">or paste</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Paste text from your document here, or describe what you want to add..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hb-teal focus:border-transparent outline-none resize-none text-sm"
                  />
                  <button
                    onClick={handleAnalyzeText}
                    disabled={!notes.trim()}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-hb-teal hover:bg-hb-teal-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze with Homer
                  </button>
                </div>
              </>
            )}

            {/* Analyzing animation */}
            {isProcessing && (
              <div className="py-12 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-hb-teal-200 border-t-hb-teal"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-hb-teal" />
                  </div>
                </div>
                <p className="text-base font-medium text-gray-900">
                  {stage === 'saving' ? 'Writing to your home profile...' : 'Homer is analyzing your document...'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {stage === 'saving'
                    ? 'Creating rooms, updating systems, and saving details'
                    : 'Reading dimensions, rooms, systems, appliances, and more'}
                </p>
                {file && stage === 'analyzing' && (
                  <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <FileText className="w-3 h-3" />
                    {file.name}
                  </p>
                )}
              </div>
            )}

            {/* Extracted results */}
            {stage === 'extracted' && extracted && (
              <div className="space-y-4">
                {extracted.summary && (
                  <div className="bg-hb-teal-50 border border-hb-teal-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-hb-teal flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-hb-navy">Homer's summary</p>
                        <p className="text-sm text-gray-700 mt-0.5">{extracted.summary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Property fields */}
                {extracted.property && Object.values(extracted.property).some(Boolean) && (
                  <Section icon={Building2} title="Property Details" color="teal">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(extracted.property).filter(([_, v]) => v).map(([k, v]) => (
                        <FieldChip key={k} label={k} value={v} />
                      ))}
                    </div>
                  </Section>
                )}

                {/* Rooms */}
                {extracted.rooms?.length > 0 && (
                  <Section icon={Layers} title={`Rooms (${extracted.rooms.length})`} color="purple">
                    <div className="space-y-1">
                      {extracted.rooms.map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg text-sm">
                          <span className="font-medium text-gray-800">{r.name}</span>
                          <span className="text-xs text-gray-500">
                            {[r.dimensions, r.sqft && `${r.sqft} sqft`, r.floor && `floor ${r.floor}`].filter(Boolean).join(' · ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Appliances */}
                {extracted.appliances?.length > 0 && (
                  <Section icon={Wrench} title={`Appliances (${extracted.appliances.length})`} color="amber">
                    <div className="space-y-1">
                      {extracted.appliances.map((a, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg text-sm">
                          <span className="font-medium text-gray-800">{a.name || a.type}</span>
                          <span className="text-xs text-gray-500">{[a.brand, a.model].filter(Boolean).join(' ')}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Systems */}
                {extracted.systems && Object.values(extracted.systems).some(s => s && Object.values(s).some(Boolean)) && (
                  <Section icon={Zap} title="Systems" color="blue">
                    <div className="space-y-2">
                      {Object.entries(extracted.systems).filter(([_, v]) => v && Object.values(v).some(Boolean)).map(([k, v]) => (
                        <div key={k} className="py-2 px-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{k}</p>
                          <p className="text-sm text-gray-700">
                            {Object.entries(v).filter(([_, val]) => val).map(([fk, fv]) => `${fk}: ${fv}`).join(' · ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Unknowns — questions for user */}
                {extracted.unknowns?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Homer has questions</p>
                    </div>
                    <ul className="space-y-1">
                      {extracted.unknowns.map((u, i) => (
                        <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-amber-600 mt-2">You can fill these in after applying.</p>
                  </div>
                )}

                {/* Conflicts */}
                {extracted.conflicts?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-900 uppercase tracking-wider mb-2">Differs from current data</p>
                    <ul className="space-y-1">
                      {extracted.conflicts.map((c, i) => (
                        <li key={i} className="text-xs text-red-700">
                          <span className="font-medium">{c.field}</span>: {c.existing} → {c.extracted}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-red-600 mt-2">Existing values stay — apply only fills empty fields.</p>
                  </div>
                )}
              </div>
            )}

            {/* Done */}
            {isDone && summary && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Home profile updated!</p>
                <div className="inline-block text-left text-sm text-gray-600 space-y-1">
                  {summary.propertyFields.length > 0 && <p>• {summary.propertyFields.length} property fields</p>}
                  {summary.roomsAdded > 0 && <p>• {summary.roomsAdded} rooms added</p>}
                  {summary.appliancesAdded > 0 && <p>• {summary.appliancesAdded} appliances added</p>}
                  {summary.systemsUpdated.length > 0 && <p>• {summary.systemsUpdated.length} systems updated</p>}
                  {summary.exteriorUpdated.length > 0 && <p>• {summary.exteriorUpdated.length} exterior items updated</p>}
                </div>
              </div>
            )}

            {/* Error */}
            {stage === 'error' && (
              <div className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-base font-medium text-gray-900 mb-2">Couldn't process that</p>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                  onClick={reset}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {(hasResults && !isDone) && (
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={reset}
                disabled={isProcessing}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Start over
              </button>
              <button
                onClick={handleApply}
                disabled={isProcessing || !extracted}
                className="flex-1 px-6 py-3 bg-hb-teal hover:bg-hb-teal-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Apply to my home
              </button>
            </div>
          )}

          {isDone && (
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={closeAndReset}
                className="w-full px-6 py-3 bg-hb-teal hover:bg-hb-teal-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                See my home
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────
const COLOR_STYLES = {
  teal: 'bg-hb-teal-50 text-hb-teal border-hb-teal-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
};

function Section({ icon: Icon, title, color, children }) {
  const style = COLOR_STYLES[color] || COLOR_STYLES.teal;
  const [bg, text] = style.split(' ');
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${text}`} />
        </div>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function FieldChip({ label, value }) {
  const pretty = label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  return (
    <div className="bg-gray-50 rounded-lg p-2.5">
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{pretty}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
