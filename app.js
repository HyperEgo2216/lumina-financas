// State Management
let transactions = [];
let fixeds = [];
let debts = [];
let userCurrency = 'BRL';

// Fictional Initial Data Check
const seedData = () => {
    if (!localStorage.getItem('lumina_seeded_v30')) {
        transactions = [
            { id: 1, type: 'income', desc: 'Salário Mensal', amount: 3500 },
            { id: 2, type: 'income', desc: 'Freela / Serviços - Logotipo', amount: 600 },
            { id: 3, type: 'expense', desc: 'Alimentação / Mercado - Atacadão', amount: 800 },
            { id: 4, type: 'expense', desc: 'Transporte / App - Uber', amount: 120 }
        ];

        fixeds = [
            { id: 1, desc: 'Aluguel + Condomínio', amount: 1200 },
            { id: 2, desc: 'Conta de Energia', amount: 150 },
            { id: 3, desc: 'Internet + Assinaturas', amount: 160 }
        ];

        debts = [
            { id: 1, desc: 'Financiamento Carro', total: 24000, months: 60, paid: 12, remainingMonths: 48, installment: 650 },
            { id: 2, desc: 'Fatura Cartão de Crédito', total: 1200, months: 4, paid: 1, remainingMonths: 3, installment: 300 }
        ];

        localStorage.setItem('lumina_transactions', JSON.stringify(transactions));
        localStorage.setItem('lumina_fixeds', JSON.stringify(fixeds));
        localStorage.setItem('lumina_debts', JSON.stringify(debts));
        localStorage.setItem('lumina_seeded_v30', 'true');
    }
};

// DOM Elements
const els = {
    totalBalance: document.getElementById('total-balance'),
    totalIncome: document.getElementById('total-income'),
    totalOut: document.getElementById('total-out'),
    subFixed: document.getElementById('sub-fixed'),
    subVariable: document.getElementById('sub-variable'),
    subDebts: document.getElementById('sub-debts'),
    incomesList: document.getElementById('incomes-list'),
    expensesList: document.getElementById('expenses-list'),
    fixedsList: document.getElementById('fixeds-list'),
    debtsList: document.getElementById('debts-list'),
    alertsContainer: document.getElementById('alerts-container'),
    healthPanelContainer: document.getElementById('health-panel-container'),
    healthPercentage: document.getElementById('health-percentage'),
    healthBarFill: document.getElementById('health-bar-fill'),
    healthMsg: document.getElementById('health-status-msg'),
    healthInsightIcon: document.getElementById('health-insight-icon'),
    balanceIndicator: document.getElementById('balance-indicator'),
    currencySelect: document.getElementById('currency-select')
};

// Utilities
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: userCurrency
    }).format(value);
};

// Modal Logic
const categories = {
    income: ['Salário', 'Rendimentos / Investimentos', 'Vendas', 'Freela / Serviços', 'Outros'],
    expense: ['Alimentação / Mercado', 'Moradia (Aluguel, Luz, Água)', 'Transporte / Gasolina / Uber', 'Saúde / Farmácia', 'Educação / Cursos', 'Lazer / Assinaturas', 'Outros']
};

window.openModal = (id, type) => {
    document.getElementById(id).classList.add('active');
    
    // Auto setup transaction modal based on type
    if (id === 'transactionModal' && type) {
        document.getElementById('transType').value = type;
        
        const categorySelect = document.getElementById('transCategory');
        categorySelect.innerHTML = '';
        categories[type].forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }
};

window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
    // Reset forms
    if(id === 'transactionModal') document.getElementById('formTransaction').reset();
    if(id === 'debtModal') document.getElementById('formDebt').reset();
    if(id === 'fixedModal') document.getElementById('formFixed').reset();
};

// Data Logic
const addTransaction = (e) => {
    e.preventDefault();
    const type = document.getElementById('transType').value;
    const category = document.getElementById('transCategory').value;
    const descInput = document.getElementById('transDesc').value.trim();
    const amount = parseFloat(document.getElementById('transAmount').value);

    // Combine category with optional description
    const finalDesc = descInput ? `${category} - ${descInput}` : category;

    const transaction = {
        id: Date.now(),
        type,
        desc: finalDesc,
        amount
    };

    transactions.push(transaction);
    saveData();
    closeModal('transactionModal');
};

const addDebt = (e) => {
    e.preventDefault();
    const desc = document.getElementById('debtDesc').value;
    const total = parseFloat(document.getElementById('debtTotal').value);
    const months = parseInt(document.getElementById('debtMonths').value);
    const paid = parseInt(document.getElementById('debtPaid').value);
    const manualInstallment = parseFloat(document.getElementById('debtInstallment').value);

    // If month data is valid, recalculate logic.
    const calculatedInstallment = (months > 0) ? (total / months) : manualInstallment;
    const remainingMonths = Math.max(0, months - paid);

    const debt = {
        id: Date.now(),
        desc,
        total,
        months,
        paid,
        remainingMonths,
        installment: manualInstallment > 0 ? manualInstallment : calculatedInstallment
    };

    debts.push(debt);
    saveData();
    closeModal('debtModal');
};

const addFixed = (e) => {
    e.preventDefault();
    const desc = document.getElementById('fixedDesc').value;
    const amount = parseFloat(document.getElementById('fixedAmount').value);

    const fixed = { id: Date.now(), desc, amount };
    fixeds.push(fixed);
    saveData();
    closeModal('fixedModal');
};

const deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
};

const deleteDebt = (id) => {
    debts = debts.filter(d => d.id !== id);
    saveData();
};

const deleteFixed = (id) => {
    fixeds = fixeds.filter(f => f.id !== id);
    saveData();
};

// Render Functions
const renderTransactions = () => {
    els.incomesList.innerHTML = '';
    els.expensesList.innerHTML = '';
    
    const incomes = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    if (incomes.length === 0) {
        els.incomesList.innerHTML = '<div class="empty-state">Nenhum ganho registrado.</div>';
    } else {
        incomes.slice().reverse().forEach(t => {
            const html = `
                <div class="transaction-item income">
                    <div class="item-info">
                        <div class="item-icon"><i class="ph ph-arrow-down-left"></i></div>
                        <div class="item-details">
                            <h4>${t.desc}</h4>
                            <p>Ganho</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="item-amount text-success">+ ${formatCurrency(t.amount)}</div>
                        <div class="item-actions">
                            <button onclick="deleteTransaction(${t.id})"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
            els.incomesList.insertAdjacentHTML('beforeend', html);
        });
    }

    if (expenses.length === 0) {
        els.expensesList.innerHTML = '<div class="empty-state">Nenhum gasto registrado.</div>';
    } else {
        expenses.slice().reverse().forEach(t => {
            const html = `
                <div class="transaction-item expense">
                    <div class="item-info">
                        <div class="item-icon"><i class="ph ph-arrow-up-right"></i></div>
                        <div class="item-details">
                            <h4>${t.desc}</h4>
                            <p>Despesa Variável</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="item-amount text-danger">- ${formatCurrency(t.amount)}</div>
                        <div class="item-actions">
                            <button onclick="deleteTransaction(${t.id})"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
            els.expensesList.insertAdjacentHTML('beforeend', html);
        });
    }
};

const renderFixeds = () => {
    els.fixedsList.innerHTML = '';
    if (fixeds.length === 0) {
        els.fixedsList.innerHTML = '<div class="empty-state">Nenhuma conta fixa cadastrada.</div>';
        return;
    }
    fixeds.forEach(f => {
        const html = `
            <div class="debt-item">
                <div class="item-info">
                    <div class="item-icon" style="color: var(--danger); background-color: rgba(239, 68, 68, 0.1);"><i class="ph ph-receipt"></i></div>
                    <div class="item-details">
                        <h4>${f.desc}</h4>
                        <p>Recorrente</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="item-amount text-danger">- ${formatCurrency(f.amount)}</span>
                    <button class="delete-btn" onclick="deleteFixed(${f.id})"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `;
        els.fixedsList.insertAdjacentHTML('beforeend', html);
    });
};

const renderDebts = () => {
    els.debtsList.innerHTML = '';
    
    if (debts.length === 0) {
        els.debtsList.innerHTML = '<div class="empty-state">Nenhuma dívida registrada.</div>';
        return;
    }

    debts.forEach(d => {
        const remainingText = d.months ? `${d.paid}/${d.months} pagas` : `Faltam ${formatCurrency(d.total)}`;
        const html = `
            <div class="debt-item">
                <div class="item-info">
                    <div class="item-icon debt-icon"><i class="ph ph-warning-circle"></i></div>
                    <div class="item-details">
                        <h4>${d.desc}</h4>
                        <p>${remainingText}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="item-amount" style="color: var(--warning)">-${formatCurrency(d.installment)}/mês</div>
                    <div class="item-actions">
                        <button onclick="deleteDebt(${d.id})"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
        els.debtsList.insertAdjacentHTML('beforeend', html);
    });
};

const checkAlerts = (income, expensesAndDebts) => {
    els.alertsContainer.innerHTML = '';
    
    if (expensesAndDebts > income && income > 0) {
        const excess = expensesAndDebts - income;
        const html = `
            <div class="alert-box alert-danger">
                <i class="ph ph-warning"></i>
                <div>
                    <strong>Atenção ao Orçamento!</strong>
                    <span>Suas despesas e dívidas ultrapassam sua renda em ${formatCurrency(excess)}. Reveja seus gastos.</span>
                </div>
            </div>
        `;
        els.alertsContainer.innerHTML = html;
    }
};

const updateHealth = (income, totalFixed, totalVariable, totalDebt, totalBalance) => {
    // Calcula porcentagem do salário que sobra
    const totalOut = totalFixed + totalVariable + totalDebt;
    const remainingRatio = income > 0 ? Math.max(0, (income - totalOut) / income) : 0;
    const score = income > 0 ? Math.round(remainingRatio * 100) : 0;

    els.healthPercentage.textContent = `${score}%`;
    els.healthBarFill.style.width = `${score}%`;
    
    // Status text update
    if (income === 0 && totalOut === 0) {
        els.healthMsg.innerHTML = 'Registre seus ganhos para ativar a inteligência do termômetro.';
        els.healthPanelContainer.className = 'health-content'; // reset
        els.healthInsightIcon.className = 'ph ph-info';
        return;
    }

    if (score >= 50) {
        els.healthMsg.innerHTML = '<strong>Excelente!</strong> Você tem abundância financeira este mês. Guarde para investir ou construir garantias.';
        els.healthPanelContainer.className = 'health-content health-good';
        els.healthInsightIcon.className = 'ph ph-check-circle';
    } else if (score >= 20) {
        els.healthMsg.innerHTML = '<strong>Saudável!</strong> O orçamento está equilibrado e você possui uma margem confortável de segurança.';
        els.healthPanelContainer.className = 'health-content health-good';
        els.healthInsightIcon.className = 'ph ph-leaf';
    } else if (score > 5) {
        els.healthMsg.innerHTML = '<strong>Atenção!</strong> Seu fôlego livre está baixo. Quase tudo que você ganha já está comprometido.';
        els.healthPanelContainer.className = 'health-content health-warn';
        els.healthInsightIcon.className = 'ph ph-warning';
    } else {
        els.healthMsg.innerHTML = '<strong>Perigo!</strong> Suas despesas engoliram sua renda. Não faça novas dívidas sob hipótese alguma.';
        els.healthPanelContainer.className = 'health-content health-danger';
        els.healthInsightIcon.className = 'ph ph-warning-octagon';
    }
};

// Core Update Sequence
const updateGrid = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalVariable = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalFixed = fixeds.reduce((acc, f) => acc + f.amount, 0);
    const totalDebt = debts.reduce((acc, d) => acc + d.installment, 0);

    const totalOut = totalVariable + totalFixed + totalDebt;
    const totalBalance = totalIncome - totalOut;

    els.totalIncome.textContent = formatCurrency(totalIncome);
    els.totalOut.textContent = formatCurrency(totalOut);
    els.totalBalance.textContent = formatCurrency(totalBalance);

    els.subFixed.textContent = `Fixas: ${formatCurrency(totalFixed)}`;
    els.subVariable.textContent = `Variáveis: ${formatCurrency(totalVariable)}`;
    els.subDebts.textContent = `Parcelas: ${formatCurrency(totalDebt)}`;

    // Update Balance Indicator
    if (totalBalance >= 0) {
        els.balanceIndicator.innerHTML = '<i class="ph ph-trend-up"></i><span>Positivo</span>';
        els.balanceIndicator.style.background = 'rgba(255,255,255,0.2)';
    } else {
        els.balanceIndicator.innerHTML = '<i class="ph ph-trend-down"></i><span>Negativo</span>';
        els.balanceIndicator.style.background = 'var(--danger)';
    }

    // Render Lists
    renderTransactions();
    renderFixeds();
    renderDebts();

    // Health & Alerts
    checkAlerts(totalIncome, totalOut);
    updateHealth(totalIncome, totalFixed, totalVariable, totalDebt, totalBalance);
};

const changeCurrency = (curr) => {
    userCurrency = curr;
    saveData();
};

const saveData = () => {
    localStorage.setItem('lumina_transactions', JSON.stringify(transactions));
    localStorage.setItem('lumina_fixeds', JSON.stringify(fixeds));
    localStorage.setItem('lumina_debts', JSON.stringify(debts));
    localStorage.setItem('lumina_currency', userCurrency);
    updateGrid();
};

// Init
const init = () => {
    seedData(); // Popula dados fictícios no primeiro acesso
    
    const savedT = localStorage.getItem('lumina_transactions');
    const savedF = localStorage.getItem('lumina_fixeds');
    const savedD = localStorage.getItem('lumina_debts');
    const savedC = localStorage.getItem('lumina_currency');
    
    if (savedT) transactions = JSON.parse(savedT);
    if (savedD) debts = JSON.parse(savedD);
    if (savedF) fixeds = JSON.parse(savedF);
    if (savedC) userCurrency = savedC;

    if(els.currencySelect) {
        els.currencySelect.value = userCurrency;
        els.currencySelect.addEventListener('change', (e) => {
            changeCurrency(e.target.value);
        });
    }

    document.getElementById('formTransaction').addEventListener('submit', addTransaction);
    document.getElementById('formDebt').addEventListener('submit', addDebt);
    document.getElementById('formFixed').addEventListener('submit', addFixed);

    // Fechar modais clicando fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) overlay.classList.remove('active');
        });
    });

    updateGrid();
};

document.addEventListener('DOMContentLoaded', init);
