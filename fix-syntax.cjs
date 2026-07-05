const fs = require('fs');
let code = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');

// Fix 1: The sidebar settings form closing tags
code = code.replace(
`                    </div>
                  </div>
                </div>
            )}
          </div>
        </AnimatePresence>`,
`                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </AnimatePresence>`
);

// Fix 2: The extra </div> in the chat view
code = code.replace(
`                  </form>
                </div>
              </div>
            </div>
            )}`,
`                  </form>
                </div>
              </div>
            )}`
);

fs.writeFileSync('src/pages/RepositoriesPage.tsx', code);
