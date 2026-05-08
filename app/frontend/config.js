// Backend Configuration
// ทำการกำหนดค่า backend URL ในที่เดียว เพื่อไม่ให้ hardcode ลงไปในหลาย endpoint

const API_CONFIG = {
    // URL ของ backend server
    BASE_URL: 'http://backend-svc:3003',
    
    // API endpoints
    ENDPOINTS: {
        TASKS: '/api/tasks'
    }
};

// ฟังก์ชัน helper เพื่อสร้าง full URL ของ endpoint
function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Export สำหรับใช้ใน script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, getApiUrl };
}
