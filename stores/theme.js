import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
    const currentTheme = ref('coffee');

    const themes = {
        milkTea: {
            name: '奶茶',
            primary: '#ff6b9d',
            secondary: '#ff8fa3',
            accent: '#764ba2',
            background: '#FFF5F4',
            backgroundGradient: 'linear-gradient(180deg, #FFF5F4 0%, #F8F4FF 100%)',
            surface: '#ffffff',
            text: '#333333',
            textSecondary: '#666666',
            border: '#ffe0e6',
            success: '#34c759',
            warning: '#ff9500',
            error: '#ff3b30',
            info: '#007aff'
        },
        matcha: {
            name: '抹茶',
            primary: '#78C06E',
            secondary: '#95D58E',
            accent: '#48BB78',
            background: '#F0FFF4',
            backgroundGradient: 'linear-gradient(180deg, #F0FFF4 0%, #E6FFFA 100%)',
            surface: '#ffffff',
            text: '#2F855A',
            textSecondary: '#68D391',
            border: '#C6F6D5',
            success: '#38A169',
            warning: '#D69E2E',
            error: '#E53E3E',
            info: '#3182CE'
        },
        taro: {
            name: '香芋',
            primary: '#9F7AEA',
            secondary: '#B794F4',
            accent: '#805AD5',
            background: '#FAF5FF',
            backgroundGradient: 'linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)',
            surface: '#ffffff',
            text: '#553C9A',
            textSecondary: '#9F7AEA',
            border: '#E9D8FD',
            success: '#38A169',
            warning: '#D69E2E',
            error: '#E53E3E',
            info: '#3182CE'
        },
        coffee: {
            name: '拿铁',
            primary: '#8D6E63',
            secondary: '#A1887F',
            accent: '#5D4037',
            background: '#EFEBE9',
            backgroundGradient: 'linear-gradient(180deg, #EFEBE9 0%, #D7CCC8 100%)',
            surface: '#ffffff',
            text: '#4E342E',
            textSecondary: '#8D6E63',
            border: '#D7CCC8',
            success: '#38A169',
            warning: '#F57C00',
            error: '#D32F2F',
            info: '#1976D2'
        },
        ocean: {
            name: '海盐',
            primary: '#4299E1',
            secondary: '#63B3ED',
            accent: '#3182CE',
            background: '#EBF8FF',
            backgroundGradient: 'linear-gradient(180deg, #EBF8FF 0%, #E6FFFA 100%)',
            surface: '#ffffff',
            text: '#2C5282',
            textSecondary: '#4299E1',
            border: '#BEE3F8',
            success: '#38A169',
            warning: '#D69E2E',
            error: '#E53E3E',
            info: '#3182CE'
        }
    };

    const currentThemeColors = computed(() => themes[currentTheme.value]);

    function setTheme(themeName) {
        if (themes[themeName]) {
            currentTheme.value = themeName;
            // Save to local storage if needed, but for now just state
            uni.setStorageSync('app_theme', themeName);
        }
    }

    function loadTheme() {
        const savedTheme = uni.getStorageSync('app_theme');
        if (savedTheme && themes[savedTheme]) {
            currentTheme.value = savedTheme;
        }
    }

    return {
        currentTheme,
        themes,
        currentThemeColors,
        setTheme,
        loadTheme
    };
});
