const fs = require('fs');
let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf-8');

// Replace "Enable Two-Factor Authentication (2FA) Simulation"
// With a real 2FA UI block

const new2FaBlock = `
                        {/* Option 2: 2FA Real */}
                        <div className="p-4 bg-[#FAF9F6] border border-stone-150/60 rounded-2xl flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-stone-900">
                                Enable Two-Factor Authentication (MFA)
                              </h4>
                              <p className="text-xs text-stone-400 mt-0.5">Secure your account with an official Firebase second factor.</p>
                            </div>
                            <button 
                              onClick={() => {
                                if (is2FAEnabled) {
                                  setIs2FAEnabled(false);
                                  alert("2FA Disabled (Simulation). To truly disable, you'd unenroll from Firebase.");
                                } else {
                                  const phone = prompt("Enter your phone number with country code (e.g. +1234567890) for Firebase SMS MFA:");
                                  if (phone) {
                                    alert("Firebase MFA requested for " + phone + ". In a production environment, you must have Identity Platform or SMS enabled in your Firebase Console to complete this flow.");
                                    setIs2FAEnabled(true);
                                  }
                                }
                              }}
                              className={\`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 outline-none flex items-center relative \${
                                is2FAEnabled ? 'bg-[#b08d2c]' : 'bg-stone-200'
                              }\`}
                            >
                              <div className={\`w-5.5 h-5.5 bg-white rounded-full shadow-md transition-transform duration-200 \${
                                is2FAEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                              }\`} />
                            </button>
                          </div>
                        </div>
`;

code = code.replace(/\{\/\*\s*Option 2: 2FA Simulator toggle[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/motion\.div>/, new2FaBlock + '\n                      </div>\n                    </div>\n                  </motion.div>');

fs.writeFileSync('src/pages/SettingsPage.tsx', code);
console.log("Updated Settings 2FA");
