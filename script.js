// --- Translations ---
const translations = {
    bn: {
        'title': 'এমএফএস চার্জ ক্যালকুলেটর',
        'subtitle': 'মোবাইল ব্যাংকিং ফি গণনা করুন।',
        'amount_label': 'টাকার পরিমাণ',
        'amount_placeholder': 'টাকার পরিমাণ লিখুন',
        'provider_label': 'প্রদানকারী',
        'provider_default_option': 'একটি এমএফএস নির্বাচন করুন',
        'transaction_type_label': 'লেনদেনের ধরন',
        'transaction_type_default_option': 'একটি পদ্ধতি নির্বাচন করুন',
        'calculate_button': 'হিসাব করুন',
        'charge_label': 'চার্জ:',
        'total_amount_label': 'সর্বমোট:',
        'fee_comparison_label': 'ফি তুলনা দেখুন',
        'comparison_table_header': 'সবচেয়ে কম খরচের ১০টি ফি',
        'table_provider': 'প্রদানকারী',
        'table_method': 'পদ্ধতি',
        'table_charge': 'চার্জ (টাকা)',
        'currency': 'টাকা',
        'error_invalid_amount': 'অনুগ্রহ করে একটি বৈধ পরিমাণ লিখুন।',
        'error_no_provider': 'অনুগ্রহ করে একজন প্রদানকারী এবং পদ্ধতি নির্বাচন করুন.',
        // Provider and Method translations
        'bKash': 'বিকাশ',
        'Rocket': 'রকেট',
        'Nagad': 'নগদ',
        'Upay': 'উপায়',
        'App': 'অ্যাপ',
        'USSD': 'ইউএসএসডি',
        'ATM': 'এটিএম',
        'Priyo Number': 'প্রিয় নম্বর',
        'Agent': 'এজেন্ট',
        'Branch': 'ব্রাঞ্চ',
        'Regular App': 'সাধারণ অ্যাপ',
        'Islamic App': 'ইসলামিক অ্যাপ',
        'Primary Agent': 'প্রাইমারি এজেন্ট',
        'Remittance Agent': 'রেমিটেন্স এজেন্ট',
        'Salary Agent': 'স্যালারি এজেন্ট',
        'Primary ATM': 'প্রাইমারি এটিএম',
        'Remittance ATM': 'রেমিটেন্স এটিএম',
        'Salary ATM': 'স্যালারি এটিএম'
    }
};

const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// Function to convert English numbers to Bengali
function convertToBengaliNumber(enNumber) {
    let bnNumber = '';
    const numberStr = String(enNumber);
    for (let i = 0; i < numberStr.length; i++) {
        const char = numberStr[i];
        const digitIndex = enDigits.indexOf(char);
        bnNumber += (digitIndex !== -1) ? bnDigits[digitIndex] : char;
    }
    return bnNumber;
}

// Function to convert Bengali numbers to English
function convertToEnglishNumber(bnNumber) {
    let enNumber = '';
    const numberStr = String(bnNumber);
    for (let i = 0; i < numberStr.length; i++) {
        const char = numberStr[i];
        const digitIndex = bnDigits.indexOf(char);
        enNumber += (digitIndex !== -1) ? enDigits[digitIndex] : char;
    }
    return enNumber;
}


// --- Dark Mode Logic ---
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;
const toggleBall = document.getElementById('toggleBall');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function setTheme(isDark) {
    htmlElement.classList.toggle('dark', isDark);
    if (isDark) {
        toggleBall.style.transform = 'translateX(24px)';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        toggleBall.style.transform = 'translateX(0)';
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialThemeIsDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
setTheme(initialThemeIsDark);
darkModeToggle.checked = initialThemeIsDark;

darkModeToggle.addEventListener('change', () => {
    setTheme(darkModeToggle.checked);
    localStorage.setItem('theme', darkModeToggle.checked ? 'dark' : 'light');
});

// --- Calculator Logic ---
const calculatorForm = document.getElementById('calculatorForm');
const amountInput = document.getElementById('amount');
const providerSelect = document.getElementById('provider');
const transactionTypeSelect = document.getElementById('transactionType');
const resultContainer = document.getElementById('result-container');
const comparisonSection = document.getElementById('comparison-section');
const comparisonToggle = document.getElementById('comparisonToggle');
const comparisonToggleLabel = document.querySelector('label[for="comparisonToggle"].toggle-bg');
const comparisonTableContainer = document.getElementById('comparison-table-container');

const CHARGE_RATES = {
    bKash: {'App': 1.85, 'USSD': 1.85, 'ATM': 1.49, 'Priyo Number': 1.49},
    Rocket: {'Agent': 1.67, 'Branch': 0.9, 'ATM': 0.9},
    Nagad: {'Regular App': 1.3, 'Islamic App': 1.5, 'Agent': 1.5},
    Upay: {'Primary Agent': 1.4, 'Remittance Agent': 1, 'Salary Agent': 1, 'Primary ATM': 0.8, 'Remittance ATM': 0, 'Salary ATM': 0.8}
};

function updateTransactionTypes() {
    const selectedProvider = providerSelect.value;
    const previouslySelectedType = transactionTypeSelect.value; // Store current value
    const currentLang = localStorage.getItem('language') || 'en';
    const defaultOptionText = currentLang === 'bn' ? translations.bn.transaction_type_default_option : 'Select a Method';
    
    transactionTypeSelect.innerHTML = `<option value="" disabled selected>${defaultOptionText}</option>`;
    
    if (selectedProvider && CHARGE_RATES[selectedProvider]) {
        Object.keys(CHARGE_RATES[selectedProvider]).forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            // Translate the text content if in Bengali
            option.textContent = (currentLang === 'bn' && translations.bn[type]) ? translations.bn[type] : type;
            transactionTypeSelect.appendChild(option);
        });

        // If a value was previously selected, try to re-select it
        if (previouslySelectedType) {
            transactionTypeSelect.value = previouslySelectedType;
        }
    }
}

providerSelect.addEventListener('change', updateTransactionTypes);

comparisonToggle.addEventListener('change', () => {
    comparisonTableContainer.classList.toggle('hidden');
    const toggleBall = comparisonToggleLabel.querySelector('.toggle-ball');
    toggleBall.style.transform = comparisonToggle.checked ? 'translateX(24px)' : 'translateX(0)';
});

calculatorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentLang = localStorage.getItem('language') || 'en';
    // Convert input to English for calculation
    const amountInEnglish = convertToEnglishNumber(amountInput.value);
    const amount = parseFloat(amountInEnglish);

    const provider = providerSelect.value;
    const transactionType = transactionTypeSelect.value;
    
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('result-box', 'p-4');
    comparisonSection.classList.add('hidden');
    comparisonTableContainer.classList.add('hidden');
    comparisonToggle.checked = false;
    if (comparisonToggleLabel) {
        comparisonToggleLabel.querySelector('.toggle-ball').style.transform = 'translateX(0)';
    }


    if (isNaN(amount) || amount <= 0) {
        resultContainer.innerHTML = `<p class="text-red-500">${currentLang === 'bn' ? translations.bn.error_invalid_amount : 'Please enter a valid amount.'}</p>`;
        resultContainer.classList.remove('hidden');
        return;
    }
    
    if (!provider || !transactionType) {
         resultContainer.innerHTML = `<p class="text-red-500">${currentLang === 'bn' ? translations.bn.error_no_provider : 'Please select a provider and method.'}</p>`;
        resultContainer.classList.remove('hidden');
        return;
    }

    const rate = CHARGE_RATES[provider][transactionType];
    const charge = (amount * rate) / 100;
    const total = amount + charge;
    
    resultContainer.classList.add('result-box', 'p-4');
    const chargeLabel = currentLang === 'bn' ? translations.bn.charge_label : 'Charge:';
    const totalLabel = currentLang === 'bn' ? translations.bn.total_amount_label : 'Total Amount:';
    const currencySymbol = currentLang === 'bn' ? translations.bn.currency : 'BDT';

    let chargeDisplay = charge.toFixed(2);
    let totalDisplay = total.toFixed(2);

    if (currentLang === 'bn') {
        chargeDisplay = convertToBengaliNumber(chargeDisplay);
        totalDisplay = convertToBengaliNumber(totalDisplay);
    }

    resultContainer.innerHTML = `
        <div class="space-y-2">
            <p><span style="color: var(--text-secondary);">${chargeLabel}</span> <strong class="accent-text">${chargeDisplay} ${currencySymbol}</strong></p>
            <p><span style="color: var(--text-secondary);">${totalLabel}</span> <strong>${totalDisplay} ${currencySymbol}</strong></p>
        </div>
    `;
    resultContainer.classList.remove('hidden');
    
    comparisonSection.classList.remove('hidden');
    calculateAndDisplayComparison(amount);
});

function calculateAndDisplayComparison(amount) {
    const allCharges = [];
    for (const provider in CHARGE_RATES) {
        for (const type in CHARGE_RATES[provider]) {
            const rate = CHARGE_RATES[provider][type];
            const charge = (amount * rate) / 100;
            allCharges.push({ provider, type, charge });
        }
    }
    allCharges.sort((a, b) => a.charge - b.charge);
    const top10 = allCharges.slice(0, 10);
    
    const currentLang = localStorage.getItem('language') || 'en';
    const header = currentLang === 'bn' ? translations.bn.comparison_table_header : 'Top 10 Cheapest Fees';
    const providerHeader = currentLang === 'bn' ? translations.bn.table_provider : 'Provider';
    const methodHeader = currentLang === 'bn' ? translations.bn.table_method : 'Method';
    const chargeHeader = currentLang === 'bn' ? translations.bn.table_charge : 'Charge (BDT)';
    
    let tableHTML = `
        <h3 class="font-bold text-center mb-2" data-lang-key="comparison_table_header">${header}</h3>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="border-b" style="border-color: var(--text-secondary);">
                    <tr>
                        <th class="p-2" data-lang-key="table_provider">${providerHeader}</th>
                        <th class="p-2" data-lang-key="table_method">${methodHeader}</th>
                        <th class="p-2 text-right" data-lang-key="table_charge">${chargeHeader}</th>
                    </tr>
                </thead>
                <tbody>
    `;
    top10.forEach(item => {
        let chargeDisplay = item.charge.toFixed(2);
        let providerDisplay = item.provider;
        let typeDisplay = item.type;

        if (currentLang === 'bn') {
            chargeDisplay = convertToBengaliNumber(chargeDisplay);
            providerDisplay = translations.bn[item.provider] || item.provider;
            typeDisplay = translations.bn[item.type] || item.type;
        }
        tableHTML += `
            <tr class="border-b" style="border-color: var(--input-bg);">
                <td class="p-2">${providerDisplay}</td>
                <td class="p-2">${typeDisplay}</td>
                <td class="p-2 text-right">${chargeDisplay}</td>
            </tr>
        `;
    });
    tableHTML += `</tbody></table></div>`;
    comparisonTableContainer.innerHTML = tableHTML;
}

// --- Translation Logic ---
const translateBtn = document.getElementById('translateBtn');

function translatePage(lang) {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        const originalText = el.dataset.originalText || (el.placeholder || el.textContent);
        
        if (!el.dataset.originalText) {
            el.dataset.originalText = originalText;
        }

        if (lang === 'bn' && translations.bn[key]) {
            if (el.placeholder) {
                el.placeholder = translations.bn[key];
            } else {
                el.textContent = translations.bn[key];
            }
        } else {
            if (el.placeholder) {
                el.placeholder = el.dataset.originalText;
            } else {
                el.textContent = el.dataset.originalText;
            }
        }
    });
    // Correctly set button text to the language you can switch TO
    translateBtn.textContent = lang === 'bn' ? 'EN' : 'BN';
    
    // Convert number in input field
    const amountValue = amountInput.value;
    if (amountValue) {
        if (lang === 'bn') {
            amountInput.value = convertToBengaliNumber(convertToEnglishNumber(amountValue));
        } else {
            amountInput.value = convertToEnglishNumber(amountValue);
        }
    }

    updateTransactionTypes(); // Refresh dropdown with correct language
}

translateBtn.addEventListener('click', () => {
    let currentLang = localStorage.getItem('language') || 'en';
    currentLang = currentLang === 'en' ? 'bn' : 'en';
    localStorage.setItem('language', currentLang);
    translatePage(currentLang);
    // Only re-submit if there's already a result visible
    if (!resultContainer.classList.contains('hidden')) {
        calculatorForm.dispatchEvent(new Event('submit'));
    }
});

// --- Number Input Handling ---
amountInput.addEventListener('input', (e) => {
    const currentLang = localStorage.getItem('language') || 'en';
    let value = e.target.value;
    
    // Allow only digits (English or Bengali) and one decimal point
    let sanitizedValue = value.replace(/[^0-9০-৯.]/g, '');
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
        sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    if (currentLang === 'bn') {
        e.target.value = convertToBengaliNumber(convertToEnglishNumber(sanitizedValue));
    } else {
        e.target.value = convertToEnglishNumber(sanitizedValue);
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    updateTransactionTypes();
    const currentLang = localStorage.getItem('language') || 'en';
    translatePage(currentLang);
});
