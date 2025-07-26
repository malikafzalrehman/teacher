import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Board icons mapping
const BOARD_ICONS = {
  'Punjab Board': 'location-city',
  'Sindh Board': 'beach-access',
  'KPK Board': 'landscape',
  'Balochistan Board': 'terrain',
  'AJK Board': 'public',
  'Oxford Board': 'school'
};

// Class data organized by board first, then class level
const boardData = {
  'Punjab Board': {
    'Pre-Primary (KG)': [
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://drive.google.com/file/d/19m8yrU20whmA7vVkEf6i6Ej7rbkPJBbv/view" },
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1ZOzM3hFOXkTLzfbTJ3JSLnWcftxZ0mg3/view" },
      { title: 'Math', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/19m8yrU20whmA7vVkEf6i6Ej7rbkPJBbv/view" },
      { title: 'Neela Qaida', icon: 'mosque', color: '#e74c3c',url:"https://drive.google.com/file/d/12eVQL6knNPkA3CVpJvNIXOYmeYK21Aws/view" }
    ],
    'Grade 1': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/17o-AGE3z00m-z8Kih389pmAeWolTxA2N/view" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1qdIPBXxaVHia6BVInY8uXWmzKkzGZ09Y/view" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1c4x62XDG-TbhF2-Aj_VIxhnm-8t8e2Ua/view" },
      { title: 'Ahklaqiat', icon: 'public', color: '#f39c12',url:"https://drive.google.com/file/d/1e5GPdHGhyfwq-RNjAJVAbXOt6Z3oP70h/view" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1wcbkbayvUt5nv_GSvHBdVBMplTuGwLVR/view" },
      { title: 'Wakifiyat e Aama', icon: 'mosque', color: '#e74c3c',url:"https://drive.google.com/file/d/1pyHTreo1lqtubCL0iGBZDNFwoRaebxAG/view" },
      { title: 'TAJVEEDI QAIDA', icon: 'mosque', color: '#e84393',url:"https://drive.google.com/file/d/1ohWq-zOojLu0vPut9zBqUUqoiyY1gFGF/view" }
      

      
    ],
    'Grade 2': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url: "https://drive.google.com/file/d/1cWaeH4aUC0xJi2kbYkmrENXmU-NnBx6L/view"},
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1mDTFzH_fwjl-ZA7peQpVAxE00C3GQ2MX/view"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/11SMlZk9Z3mdAG49ewxxK0ge1DnvyKViZ/view" },
      { title: 'Ahklaqiat', icon: 'public', color: '#f39c12',url:"https://drive.google.com/file/d/1tyeA7dylxYzNFqQlF67JNV78tl03l2l4/view"},
       { title: 'Wakifiyat e Aama', icon: 'mosque', color: '#e74c3c',url:"https://drive.google.com/file/d/1zcFk3RFMgOqGpsZWtJi67kSAyDgC9kw_/view" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1Z6_q9lf4H2zdXw_VInOMIUZRLFG_QL8X/view" },
      { title: 'NAZRA QURAN', icon: 'palette', color: '#e84393',url:"https://drive.google.com/file/d/12c5yKIIjnyVjiV89OOKDGtE-amxkVrfF/view"}
    ],
    'Grade 3': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1LNXCmSfpIBA2OgHSx1wn_FeOzvr-MKbn/view" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/11xsJrNr0ONZO8wJUSIq8p0SiK7tLyWZP/view" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' ,url:"https://drive.google.com/file/d/1C69gAPjeD2yKfyvDG97kZIiTGJwCbTr2/view"},
      { title: 'Ahklaqiat', icon: 'science', color: '#9b59b6' ,url:"https://drive.google.com/file/d/1IiZhg6zhdlXAYNz_piPnCb4_wggIFMN2/view"},
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' ,url:"https://drive.google.com/file/d/1aqVKG8-2-AIG3Y2K65C1KWZWB1R7XisG/view"},
      { title: 'Wakifiyat e Aama', icon: 'public', color: '#f39c12',url:"https://drive.google.com/file/d/120tl2Vz_PhCAAqtivosUlnh9DOiQ3Fs8/view" },
      { title: 'NAZRA QURAN', icon: 'mosque', color: '#e84393',url:"https://drive.google.com/file/d/125VXr4hNUS_90tLX0Vx6aASghIKBcfKI/view" }
    ],
    'Grade 4': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1lmfd019QlRWK-ZBJr0Ze7eLPU1PxIbfs/view" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1YxAHOKvHXjdzQVy_RvoZeuugrHL3t0_e/view" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1fpvfnz1sb6arKs8fcumu-Hgl4LjM34eh/view" },
      { title: 'General Science', icon: 'science', color: '#9b59b6' ,url:"https://drive.google.com/file/d/1dAS1tPwg-kAAaN6dF1M-InwLJwl8OTWK/view"},
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/13HfdenXkBOLf_3kHQHV_VH4MzoalQqXX/view" },
      { title: 'Social Studies', icon: 'public', color: '#f39c12',url:"https://drive.google.com/file/d/1EFPSWwGq32iIT-eDGKqtVjMsOeoMHUAD/view" },
      { title: 'Ahklaqiat', icon: 'computer', color: '#2c3e50' ,url:"https://drive.google.com/file/d/1_E6f2daSK68EXKe4s-JdpzlJWcIJs6ki/view"},
      { title: 'NARZA QURAN', icon: 'mosque', color: '#e84393',url:"https://drive.google.com/file/d/1Ba8QJM31iXxivUuKZLIAZZJ17PejDENB/view" },
      
    ],
    'Grade 5': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/10OQQYD3q-k6-Oq9m-5PwC5mg7Y2rbX_4/view" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1jsODAQskQsmY_SUp_4xJS7_4VB2lEfat/view"  },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1JGSOgl61IFiwosrBQQVwLOo8FEt2tDA1/view"  },
      { title: 'General Science', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/1dwl4glSoZ2c1AYVKXH1IIkTSC4B3s97E/view"  },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1xvIrc83nySxsysX5g6u7YN-yFeGe3QLb/view"  },
      { title: 'Social Studies', icon: 'public', color: '#f39c12',url:"https://drive.google.com/file/d/1FOp-kWZ_Z7hLcMsFaVxAkuzIdWVO56oe/view"  },
      { title: 'Ahklaqiat', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1GoMHXY1XOB1O3Z1RFOMY6eWOplgAyP7-/view"  },
      { title: 'NARZA QURAN', icon: 'mosque', color: '#e84393',url:"https://drive.google.com/file/d/10seBJAaN5l1CW_sRWKto4WQZRqnKqaFz/view"  }
    ],
    'Grade 6': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' ,url:"https://drive.google.com/file/d/1fjKTF0VJ9rGwEwrb1iYMZkuYxu4RmsdA/view"},
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://drive.google.com/file/d/1J2WmRQ8acfiz3ZMCoWGisyE9qwnfclKY/view"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1mrKk0eG9rXxnQn2NJ2Sh_nH1U5wj2W1i/view" },
      { title: 'Science', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/1DBdylHYJf82704FwDsr3MpQNEy1h5U-k/view" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1sce17Q3P-dyNorHZpSdOTfST5-OMPHce/view" },
      { title: 'TARJUMA TUL QAQAN MAJEED', icon: 'mosque', color: '#8e44ad' ,url:"https://drive.google.com/file/d/1U-E0-_l_ERWaoomo0KRM3xXRbMNIKheE/view"},
      { title: 'Art & Drawing', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1UNoKKjJj3XxDIzypldyBrcIndgE9AfaS/view" },
      { title: 'Arabic', icon: 'mosque', color: '#3498db',url:"https://drive.google.com/file/d/1eyir16wfi0C3UegVBo-bAB4C45fqvWdC/view" },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1iZWa6KY50JzkMd5I8xiiEy-64v0c7QiZ/view" },
      { title: 'Geography SNC', icon: 'map', color: '##8e44ad',url:"https://drive.google.com/file/d/1VhVINAr69UPAtnh3h7Ddt_KoHAidCY_4/view" },
      { title: 'History', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1VhVINAr69UPAtnh3h7Ddt_KoHAidCY_4/view" },
      { title: 'Ahklaqiat', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1jpoj-jZT16QyDNGw-wCLn3r8WtfP-nOz/view" },
      { title: 'ZARI TALEEM', icon: 'science', color: '#3498db',url:"https://drive.google.com/file/d/1cPKPU_FjEaG2y3Tslsus5WqX48jcZqfd/view" },
      { title: 'Punjabi', icon: 'menu-book', color: '#2c3e50',url:"https://drive.google.com/file/d/1OYkUT_VF_8j2UJ1_yljPa4jvLDOsO-W7/view" },
      { title: 'Farsi', icon: 'translate', color: '#9b59b6',url:"https://drive.google.com/file/d/1XnbK7uOq7rn5IEZOxxqrOzGvVuCxUDX8/view" },
      { title: 'Itlaqi Barqiyat', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1hvMVMj8ygB9ir4HzhYLSxi9qXlx9GaH3/view" },
      { title: 'Home Economics', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1Q9xJqkTZ83DPPHa710KExHZWENebCtDC/view" },
      { title: 'Geography', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1wqc8Zvqk26bxBxyy-lXP1VTjn1xdgObj/view" }
    ],
    'Grade 7': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1uqgeKN-J11LdgkNeCiJunDcXMTRirt8a/view" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1EyfyU6OAE61w2RqAQQSRx_hbvVaIm9ew/view" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1aIKToDIBjBgS_8A2Thmbm46srz4r338i/view" },
      { title: 'Science', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/14r9bFkXbR_lBGma5m2Bh20Mm7vhWmMpW/view" },
       { title: 'Art & Drawing', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1Oar7_KC6r5UHwMkYV-e5GR6yZRVbhr0k/view" },
      { title: 'Science urdu Medium', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/1hjYIne7bxgY91E_ZhUmRunJtT2jDlvGd/view" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1g5mgMgPAcCUB-70JoGNbKk-Vu4cYjteC/view" },
      { title: 'Arabic', icon: 'mosque', color: '#8e44ad',url:"https://drive.google.com/file/d/1pzN6br_CJHQ7niuDa3uSYYIr99Yt85T1/view" },
      { title: 'TARJUMA TUL QURAN UL MAJEED', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/123L_ClDHd6uH9Sw-83rkAIoGhuEQNomZ/view" },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1LgxaMdjj-BiC-MEkQfSXBVXD7x4c9dy9/view" },
      { title: 'Geography', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1jcC0QyYAg_j0s_95ukvs-w9-eyLV9qQZ/view" },
       { title: 'History', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/17ByBOJMShn8Mps2dOSMy5t2u7oTseZ59/view" },
        { title: 'History Urdu Mideum', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1UxKj6IhIPmwA3UWV84e-3ZZl-1pN65vg/view" },
      { title: 'Ahklaqiat', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1RRBSrb6SL02Ndn9YcnmUqYCcMoM7IJ5S/view" },
      { title: 'ZARI TALEEM', icon: 'science', color: '#3498db',url:"https://drive.google.com/file/d/1qir-o2wxq9gpWnOC1oBR4_iRlhbQJCea/view" },
      { title: 'Punjabi', icon: 'menu-book', color: '#2c3e50',url:"https://drive.google.com/file/d/1o1KKNfM4RluZYf-pKgE7f7tuJjtCBxdc/view" },
      { title: 'Farsi', icon: 'translate', color: '#9b59b6',url:"https://drive.google.com/file/d/1uFeKHyzJd4Eb8dcyYFSeQVm7lF5R_QoE/view" },
      { title: 'Itlaqi Barqiyat', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/19PU6OLJ8gwJn5byZOnW8HugorFTBMbKW/view" },
       { title: 'Home Economics', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1hxrGjfRrVRWarrjpMkjVoqaXd4yAj7ji/view" },
      { title: 'Geography urdu Medium', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1IcRoT1RqG2gwhbyHeO93PKnN3d8_FDCE/view" },
      { title: 'Home Economics Urdu Mideum', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1GKPcqeq_ZTI-HLGyyF-hcr8XFl0tH4zc/view" }
    ],
    'Grade 8': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1b_tMiA-YJ3ujhvrQQVJ43MGR3MlQykZh/view" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1VjslGe1d421x--q0gxAn2l4tYx3zAKF3/view" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1nu_CRaFBMu2C5mgJd7Y-ekzOVITP-9rq/view" },
      { title: 'Science', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/14fpAa9TGsayEuMYuwY9gaRU9c_PKky_s/view" },
      { title: 'Art & Drawing', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1P7A3MzWR4r6SKPrQMGaDzXtkgI3Th_di/view" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1wSqIrXtfu0qjaMKlRdMnQ3eOKG3kF-jC/view" },
      { title: 'Arabic', icon: 'mosque', color: '#8e44ad',url:"https://drive.google.com/file/d/1FIATDLIZyaKZkJOrhlJyaoYavRfLNpnc/view" },
      { title: 'TARJUMA TUL QURAN UL MAJEED', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1Gs2TIBIS5TumiHy1WlCm6yDYFyQnGSeH/view" },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1HcurSgdPnqAIuyVzzoKCDk_rGV-t5LsM/view" },
      { title: 'Geography', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1aMxVwR0tg25ZzUKF17yGYJ6WIqLlh2X1/view" },
       { title: 'History', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1hRe3ZTRWQrMEcnWWPJtopp-u5intUob2/view" },
       { title: 'History Urdu mideum', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/13hHZDDx9dDi3spCIMclj7CVkQ1t50eVP/view" },
       { title: 'Ahklaqiat', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1U0XEoha1jvTgcclNxlicz4Zr64eCb0Jd/view" },
      { title: 'ZARI TALEEM', icon: 'science', color: '#3498db',url:"https://drive.google.com/file/d/1DZM5FjdhBaVlU1FeGFPBAiofP6w6Rt3I/view" },
      { title: 'Punjabi', icon: 'menu-book', color: '#2c3e50',url:"https://drive.google.com/file/d/1gQqk-gR9TUj_cfkcAFIrQFLtoCfRwyET/view" },
      { title: 'Farsi', icon: 'translate', color: '#9b59b6',url:"https://drive.google.com/file/d/1iOVilJOB29LSynrEGb8EIwdtte_AVEZj/view" },
      { title: 'Itlaqi Barqiyat', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1afDFrcvKT-8DeVz0Ro3RaeIcHBUeiqLh/view" },
       { title: 'Home Economics', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/15M-UTWB2ZI8qZEwYUxIpDmXM8R_H_gcO/view" },
      { title: 'Geography urdu Medium', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/13hHZDDx9dDi3spCIMclj7CVkQ1t50eVP/view" },
      { title: 'Home Economics Urdu Mideum', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1MJaRDwgBkdC6-ADZAh1-wc72PeNR8TLj/view" }
    ],
    'Grade 9': [
      { title: 'TARJUMA TUL QARAN UL MAJEED', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/157EhLaNBr6h1XNrF6k2mflsdui9RfYaU/view" },
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1kiaCqhXsXuuZ7HAAuXYfjl4_WaBf-ARS/view" },
      { title: 'English 2023 2024', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1FINjBKx-C1rlY1EiWGXIsiPVitYMx-5v/view"  },
      { title: 'English 2025 2026', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1mWBO-wzXqv0Oq9oazcjM-Y16EqmPqBtj/view"  },
      { title: 'Mathematics Urdu Medium', icon: 'calculate', color: '#e74c3c',url:"https://pctb.punjab.gov.pk/system/files/2019-G09-Math-UM_0.pdf"  },
      { title: 'Mathematics English Medium', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1IHxM96F221JY3uL4jEIRWQ8NxskXyilF/view" },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' ,url:"https://drive.google.com/file/d/14TEL4poDp5vvAP7JZ3dYXJ4U_9fPexm3/view" },
      { title: 'Physics Urdu Medium', icon: 'bolt', color: '#f1c40f' ,url:"https://drive.google.com/file/d/1rtZ0dcffy5v-TQljJZ2YNTO5ZZC_O461/view" },
     { title: 'Physics PNB', icon: 'bolt', color: '#f1c40f' ,url:"https://drive.google.com/file/d/1z4U1eg79ArFl2PbHB0TpErB4YGSICPbp/view" },
      { title: 'Physics PNB Urdu Medium', icon: 'bolt', color: '#f1c40f' ,url:"https://drive.google.com/file/d/1cMY08hSQfVRaeSNPJ5Htc4_WgGwNbL_b/view" },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' ,url:"https://drive.google.com/file/d/1OY1Unpm8VkLCGQfbLFrE8wLn3fzXmZpc/view" },
      { title: 'Chemistry Urdu Medium ' , icon: 'science', color: '#9b59b6' ,url:"https://drive.google.com/file/d/1nihyc6mbyX0HHbfkGpFzcIUX2-lDJPPP/view" },    
      { title: 'Chemistry PNB  ' , icon: 'science', color: '#9b59b6' ,url:"https://drive.google.com/file/d/1nihyc6mbyX0HHbfkGpFzcIUX2-lDJPPP/view" },
      { title: 'Chemistry PNB Urdu Medium ' , icon: 'science', color: '#9b59b6' ,url:"https://drive.google.com/file/d/1cMY08hSQfVRaeSNPJ5Htc4_WgGwNbL_b/view" },    
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1rH5qC3FM12nPcH1zIVbm25tMKWxMv-3P/view" },
      { title: 'Biology PNB', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1P8nFxlRfGXJ3Oz982r05egasRq9PWmXj/view" },
      { title: 'Biology Urdu Medium', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1e3G8f_Egp4v5VUiUkZxuk8c-Iomg2QKV/view" },
      { title: 'Biology Urdu Medium PNB', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1yofgNs45BuqiASIcFTtnPkEv2A1wEPPp/view " },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1j8QTq_tyjH_hUbsAqrkxZnmryoLPAq4F/view"  },
      { title: 'GHIZA OUR GHIZAYAT', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1e3G8f_Egp4v5VUiUkZxuk8c-Iomg2QKV/view" },
      { title: 'Computer Science Uedu Medium', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1pQdFJYXXBnkq6b8Nb8hnDyb0M0JpVKpP/view"  },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' ,url:"https://drive.google.com/file/d/1kiaCqhXsXuuZ7HAAuXYfjl4_WaBf-ARS/view" },
      { title: 'TAxile and Clothing', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1DOfWIk1Tt_WonJrNssSby3lYsJ6HjXe0/view" },
      { title: 'Art & Drawing', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/10ysNFUXz8Xucox9uQY8nj6uFb2XtyWzB/view" },
     { title: 'Art & Drawing urdu Medium', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1pn9tQfNMIP3j0UkjOXTXLY_Fv3dQY6Cx/view" },
      { title: 'Ahklaqiat', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1vS1TQhpOttZRfPhkcUPMz-YxVAn8kD55/view" },
      { title: 'Communication skills', icon: 'menu-book', color: '#2c3e50',url:"https://drive.google.com/file/d/1Zvc7OuZLU7K3NJlBAsItESw6QCwLTZs-/view" },
      { title: 'Agriculture Sciences', icon: 'translate', color: '#9b59b6',url:"https://drive.google.com/file/d/1l0VrqpNpeU2wTe2dn8wybuNWr9DDa32D/view" },
      { title: 'Bio Tech  ', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1I9F9tqWqaGBndZSR3DzyaBtsG1ImpU5l/view" },
      { title: 'Bio Tech Urdu Medium ', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/18hKlhb7UJUDtIsn5Q_tNgz321h93PDN9/view" },
       { title: 'Home Economics', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/11ek9V9O_OAExO6fWvWeexhOhkUwDgq3d/view" },
      { title: 'Fashion designing ', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1FBo8CD6rbbFDKJLzYSggRycinmZOTRgS/view" },
      { title: 'Pakistan Studies', icon: 'account-balance', color: '#8e44ad',url:"https://drive.google.com/file/d/1Z9fnK77LPs7FUHxeSEUY-w5osijGkl3t/view"  },
      { title: 'Pakistan Studies Urdu Medium', icon: 'account-balance', color: '#8e44ad',url:"https://drive.google.com/file/d/1Z9fnK77LPs7FUHxeSEUY-w5osijGkl3t/view"  }
    ],
    'Grade 10': [
      { title: 'TARJUMA TUL QARAN UL MAJEED', icon: 'menu-book', color: '#27ae60',url:"https://drive.usercontent.google.com/download?id=1DMkY84-p4zsQbjKzyGcsTxIXsMGDxOeM&export=download&authuser=0" },
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/18tSuH5M7a5QSarmm-hkIggxImtSp6M73/view?usp=sharing" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/11dohkOXSikmxJgGomYBo1TdAMfaMoPnV/view" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1qdbKbuuHT80byq6gO1i6l6konU0lAoDW/view"  },
      { title: 'Mathematics Urdu Medium', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1jOIZC6B2lSPDofjH23274YfAbn9hTtnf/view"  },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/1ZUhUAkGyAxbVAWIWNF6G3m1q4HTWk604/view"  },
      { title: 'Physics Urdu Medium', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/1ZUhUAkGyAxbVAWIWNF6G3m1q4HTWk604/view"  },
       { title: 'Physics PNB', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/1a-PO8F8qtOHhF8HLeWOCpPM9FFG1M9yZ/view"  },
      { title: 'Physics PNB Urdu Medium', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/17rtfHf3vy57EuCmxMpH5R8yJhLxcnoaS/view"  },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/1Dc3uLt6sUFRPqOeIiHpGKkubOMPOxsz5/view"  },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71',url:"https://drive.google.com/file/d/1_ZseEY6DSDJZ70bY-xwzNcvDt27jJ3fY/view"  },
     { title: 'Biology Urdu Medium', icon: 'biotech', color: '#2ecc71',url:"https://drive.google.com/file/d/14MARLXThhqecaUPsESYmf8qmRyYG73DX/view"  },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1yKlB9hKd9tkz00xkmnNhzPD75mTYDzuF/view"  },
      { title: 'Computer Science Urdu Medium', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1IAobikFrUu0aZ7nGGYVdVb6OAtDjzPVd/view"  },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/17pwBhL5Zcr19mcEZwa0hXuG62SYC-YfV/view"  },
      { title: 'GHIZA OUR GHIZAYAT', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1A5RbcMqd5tb4HSPJg5ETcgs7IVQecUx-/view" },
      { title: 'Taxile and Clothing', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1LxyHrI2fqsr6-m3iWNlexjWc9nkfwnux/view" },
      { title: 'Art & Drawing', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1Ll9B5qkF-NgIvlgFfEAx43kvWO6rB6Pu/view" },
      { title: 'Art & Drawing urdu Medium', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1yye9z82IEmvjDJn6f_jfaTMID-SRVRgd/view" },
      { title: 'Ahklaqiat', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1WySlT2PhoDU-Ulym-UBArfsC3SM7BUb-/view" },
      { title: 'ZARI TALEEM', icon: 'menu -book', color: '#2c3e50',url:"https://drive.google.com/file/d/1olRc_30qz47M71FFmdPS4Sfkjc9iITQX/view" },
      { title: 'Garnal Sciences 9-10', icon: 'translate', color: '#9b59b6',url:"https://drive.google.com/file/d/1JpqDG39mhcFxq0cx1pRfx3_lLR6xwsLs/view" },
      { title: 'Garnal Sciences 9-10 Urdu Medium', icon: 'translate', color: '#9b59b6',url:"https://drive.google.com/file/d/1kX5PVHh8f2u9r_gUIGewxh2T_xSl3P_e/view" },
      { title: 'ENGLISH GRAMMER 9-10 ', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1SOthleP3bosiOobT5Zwbi0Ceq7J091pc/view" },
      { title: 'PANJABI IKHTARI ', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1jJSG3eMqZRpKHF_-elqDg6zO1ku4zlMQ/view " },
      { title: 'Economics', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1TDtLr6-Tb7_qXUHfBbJQarir-MDgHPuK/view" },
      { title: 'Economics Urdu Mediem', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1TYeS-sLBmy1PbZNAQb1v2C2kDgZ4INeK/view" },
      { title: 'Health & Physical EDU 9-10 ', icon: 'map', color: '#1abc9c',url:"https://drive.google.com/file/d/1guhX5SdSB4JgSiCgVBfQyBud4K3y-sND/view" },
      { title: 'Pakistan Studies', icon: 'account-balance', color: '#8e44ad',url:"https://drive.google.com/npfile/d/1vy_li04BE3Yir-Q4FO9waNiDfDkGZfu9/view" },
      { title: 'Pakistan Studies Urdu Medium', icon: 'account-balance', color: '#8e44ad',url:"https://drive.google.com/file/d/16fzxuMNoh-kTUp-HaqE0UVZaHs238zqv/view" }
    ],
    'Grade 11': [
      { title: 'TARJUMA TUL QARAN UL MAJEED', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/13-5E7OTI7SXT_n8n3JVr2w1FoA-3YC5k/view" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1vzB0IOxkuFyV-oBRtMLcORg-9zeA2AvK/view"  },
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1RbV-xNcr1EQWCq-vFLhEPQOvKR-ypou2/view" },
      { title: 'Physical Geography', icon: 'calculate', color: '#27ae60',url:"https://drive.google.com/file/d/1MsR3fBJ96z96-wkLsf4d7EbWOP2mY73L/view" },
      { title: 'English I (Short stories)', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1UZWpMZqDULa2LQxOxmS2Kx9xmt9MhpmR/view" },
      { title: 'English III 2020', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1CKOaS_Xdhif0nCBuN3odRADszw4kxnou/view" },
      { title: 'Mathematics 2020', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/12ZwmEwOKAAqPg58uUmkC5xU2zrqYtHtl/view"  },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/15BNgMeeVTOKT7hgUYR95UhP89JjXkB3y/view"  },
      { title: 'Islamiyat Urdu Medium', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1OwT0DGdQUunbTVq8mc4raZgzZeVj8qLn/view"  },
      { title: 'Economics', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1TyV2p2dxexTpbTvL-PqK5kLfn2XmSD6A/view" },
      { title: 'Statistics 2020', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/12-qoGhuUvsLkBHSCQ-JJuDe9Do62FT3a/view"  },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71',url:"https://drive.google.com/file/d/1SEsJqSF5DrFcXm9v7OvJX0tXIFmkdWkH/view"  },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/1qug6abtqmdOBhtFzZwviLrkggMq9svLQ/view"  },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1A_fvlHW-N2aBMH6XiYHkgJfmCcc4y-BZ/view"  },
      { title: 'Civics 2023-24', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/14uhOVjM1vc7uPc7qv-k6lUNDwUo1v5-K/view"  },
      { title: 'PANJABI IKHTARI ', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1WUraJ-KY41PRDW0SyDN_qmf45rOxyHeG/view" },
      { title: 'Iim ul Taleem', icon: 'mosque', color: '#16a085',url:"https://pctb.punjab.gov.pk/system/files/2018-G11-ILM%20UL%20TALEEM-UM.pdf"  },
      { title: 'Farsi 2020', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1e_KZXg31XUKV12V37nbNXQjCr4agJU_Y/view" },
      { title: 'Mubadiyat falsfa', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/12G6aUkM5TOozIylymiOGVhag5ST_lrgP/view" },
      { title: 'Phychology (Nasfiyat) Urdu Medium', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1Nkedemd417cLWoNL488eufMLdtqxohk3/view" },
      { title: 'Muraqa-e-Adab', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1Q3K2yvzsELPsLDUMk_OfILJMjwWHiTT_/view" },
      { title: 'Iim ul Taleem Urdu Medium', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1aLZM3juxqvFbXFpv11MVLWuhaLwe86g-/view"  },
      { title: 'Akhlaqat 2023-24', icon: 'menu-book', color: '#2c3e50',url:"https://drive.google.com/file/d/1FlWT8Xwn9aYVQLcUltNyI5o5nmXMQmrp/view" },
      { title: 'English II 2025-26', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1pGGeTfA_icnSQcNCyw_74UaVLhSXveS8/view" },
      { title: 'Physics II 2025-26', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/1l4lEddAJvJ_KjPOaU3hAeBmdZkG6RGiW/view"  },
      { title: 'Mathematics II 2025-26', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/12KTRPM54MV7_Nc9ifN_kjPMek6wT1oRX/view"  },
      { title: 'Biology II 2025-26', icon: 'biotech', color: '#2ecc71',url:"https://drive.google.com/file/d/1qEKiX0Gdpr_w2WgA7Ma4URd91UDTBVRk/view"  },,
      { title: 'Computer II 2025-26', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1eWO5ULWhPVDUyBbKX1WM8vymr2YxmYps/view"  },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/19CrddQZZCTzG3zLYOTn-CppczGyQR72H/view"  },
      { title: 'Urdu II 2025-26', icon: 'menu-book', color: '#8e44ad',url:"https://drive.google.com/file/d/1eBSJe5LtViw1I078FVOT121OGJeljPVb/view" }
    ],
    'Grade 12': [
      { title: 'TARJUMA TUL QARAN UL MAJEED', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1BYO3WE1_zdfx3xdTEtz6h83eTsLfBPdY/view?pli=1" },
      { title: 'Human Geography', icon: 'calculate', color: '#27ae60',url:"https://drive.google.com/file/d/1KKzcZDp6GR3Jqs3PGDfHmwomU9bwJz5h/view" },
      { title: 'Urdu 2020', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/11xFErLIzGIuQgZDShaBLbpkoE2cQxNjz/view" },
      { title: 'Mr Chips', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1juK6D7Z8G9el_ndHbdXqgruDU75tVFH6/view" },
      { title: 'English II 2020', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1Nm-dlT0jwgFSVKaKJ6wuGGkj_naMKfsQ/view" },
      { title: 'Mathematics 2020', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1WDl6Vy0FQ4A10-qyYg6cipaaniWI9CIB/view"  },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f',url:"https://pctb.punjab.gov.pk/system/files/G12-PHYSICS%20r.pdf"  },
      { title: 'Economics', icon: 'menu-book', color: '#9b59b6',url:"https://drive.google.com/file/d/1hpdlUNGLZn6LPFIawwUlB3apxin2P6EU/view" },
      { title: 'Statistics 2020', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/1OfKr3W7ysNLubV4pJT3Rcbzu566mRd_w/view"  },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71',url:"https://drive.google.com/file/d/1PQMrP44cXssuI1OJDCPE1YPz4dhwi_sY/view"  },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6',url:"https://drive.google.com/file/d/1_3_fJt9AWxRP7AQEmvhVb8n6rOOlqv3q/view"  },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1cb7vS2EPLxdBJw_JWifjXZB1NriBoRJB/view"  },
      { title: 'Civics 2023-24', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1alJkhKZwl1xcxl067mwF64qUCWUZ1qIM/view"  },
      { title: 'PANJABI IKHTARI ', icon: 'computer', color: '#2c3e50',url:"https://drive.google.com/file/d/1k_i-Su8oPQ2h1vQdoSfoqRux5SgYFxBR/view" },
      { title: 'Iim ul Taleem', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/18jeujdyMCpyiyVSwI_8F63TUeXXcuQ7t/view"  },
      { title: 'Farsi 2020', icon: 'biotech', color: '#2ecc71' ,url:"https://drive.google.com/file/d/1oIRalghgA3KlU9G-Hayzq23W80Dzr-Hj/view" },
      { title: 'Geography Workbook', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1EjXpL7x7r05BrvKM7FtfzMdjjwkU06Qp/view" },
      { title: 'Phychology (Nasfiyat) Urdu Medium', icon: 'people-outline', color: '##8e44ad',url:"https://drive.google.com/file/d/1ZRZtic47vymASUoqb6FUZ_R5L12oXObW/view" },
      { title: 'Hadiqa-tul-Adab', icon: 'menu-book', color: '#27ae60',url:"https://drive.google.com/file/d/1HntT-0u1nciYMVzxKyF0tO1BJdkyFmO4/view" },
      { title: 'Iim ul Taleem Urdu Medium', icon: 'mosque', color: '#16a085',url:"https://drive.google.com/file/d/1jCJXYcTsQHPLtkfiwg_VFmv5RB_kwJt6/view"  },
      { title: 'Akhlaqat 2023-24', icon: 'menu-book', color: '#2c3e50',url:"https://drive.google.com/file/d/1dZDOCSvAd738tEoLZzj8f6tNcjCL1LgS/view" },
      { title: 'Akhlaqat 11-12', icon: 'translate', color: '#3498db',url:"https://drive.google.com/file/d/1ykzyNur64AqAFF68Q1MxFlfTdDitzalY/view" },
      { title: 'Sehat-o-Jismani Taleeem', icon: 'bolt', color: '#f1c40f',url:"https://drive.google.com/file/d/1cHCiX_Pq-4EEB9698otx_OEIjwr65hYC/view"  },
      { title: 'ENGLISH GRAMMER', icon: 'calculate', color: '#e74c3c',url:"https://drive.google.com/file/d/1MjEGc8wJjMhSyyWFghg_beASRVnEqELb/view"  },
      { title: 'Home Economics', icon: 'biotech', color: '#2ecc71',url:"https://drive.google.com/file/d/19Y6fX5qTKvJDxS4k4tPVq3c2cAtbPKTX/view"  },,
      { title: 'Urdu Quaid-e-insha 11-12', icon: 'menu-book', color: '#8e44ad',url:"https://drive.google.com/file/d/129lEy_rsYLa3CYS_j3s_0I8vnbyc_mG3/view" }
    ]
  },
  'Sindh Board': {
    
    'Grade 1': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1007128471.pdf" },
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/21906831.pdf"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/263936761.pdf"},
      { title: 'General Knowledge', icon: 'public', color: '#f39c12' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/263936761.pdf"},
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/230206327.pdf" }
    ],
    'Grade 2': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1432220816.pdf"},
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/542277412.pdf"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1267982359.pdf"},
      { title: 'General Knowledge', icon: 'public', color: '#f39c12' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1432220816.pdf"},
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1321947486.pdf" }
    ],
    'Grade 3': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/609494385.pdf"},
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/401940678.pdf"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1326431925.pdf" },
      { title: 'General Science', icon: 'science', color: '#9b59b6',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/435268777.pdf" },
      { title: 'Mazhabi Taleemat', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1993599843.pdf"},
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/485538441.pdf" }
    ],
    'Grade 4': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1110253046.pdf" },
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1374240178.pdf"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/196006666.pdf" },
      { title: 'General Science', icon: 'science', color: '#9b59b6',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/166714314.pdf" },
      { title: 'Mazhabi Taleemat', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/893433794.pdf"},
      { title: 'Social Studies', icon: 'public', color: '#f39c12' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/135794496.pdf"},
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1043553246.pdf" }
    ],
    'Grade 5': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1260775432.pdf"},
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1769919276.pdf"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1151560911.pdf"},
      { title: 'General Science', icon: 'science', color: '#9b59b6',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/956652590.pdf" },
      { title: 'Mazhabi Taleemat', icon: 'mosque', color: '#16a085',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1194404163.pdf" },
      { title: 'Social Studies', icon: 'public', color: '#f39c12',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1925706686.pdf" },
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1383093964.pdf" }
    ],
    'Grade 6': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/434838470.pdf"},
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1415215452.pdf" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/301699144.pdf" },
      { title: 'Computer', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/605895462.pdf"  },
      {  title: 'Computer English', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/250999632.pdf"  },
      { title: 'Science', icon: 'science', color: '#9b59b6',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1204530236.pdf" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2138918275.pdf"},
      { title: 'Islamiyat English', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/974433140.pdf"},
      { title: 'Arabic English', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1557977445.pdf"},
      { title: 'Arabic ', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2102829916.pdf"},
      { title: 'Mazhabi Taleemat', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2038158440.pdf"},
      { title: 'Pakistan Studies English', icon: 'account-balance', color: '#8e44ad',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/250999632.pdf" },
      { title: 'Pakistan Studies', icon: 'account-balance', color: '#8e44ad',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2038158440.pdf" },            { title: 'Pakistan Studies', icon: 'account-balance', color: '#8e44ad',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2038158440.pdf" },
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/921741878.pdf" }
    ],
    'Grade 7': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1456956528.pdf" },
      { title: 'Asan Urdu', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1817435104.pdf" },
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/677756185.pdf"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1635645555.pdf" },
      { title: 'Computer', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/605895462.pdf"  },
      { title: 'Computer English', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/250999632.pdf"  },
      {  title: 'Scinece English', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1934826973.pdf"  },
      { title: 'Arabic ', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2102829916.pdf"},
      { title: 'Arabic English ', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1635645555.pdf"},
      { title: 'Mazhabi Taleemat', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2091555582.pdf"},
      { title: 'Science', icon: 'science', color: '#9b59b6',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1204530236.pdf" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2138918275.pdf" },
      { title: 'Islamiyat English', icon: 'mosque', color: '#16a085',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/974433140.pdf" },
      { title: 'Pakistan Studies', icon: 'account-balance', color: '#8e44ad',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2038158440.pdf"},
      { title: 'Pakistan Studies English', icon: 'account-balance', color: '#8e44ad',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2145110833.pdf"},
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/815315974.pdf" }
    ],
    'Grade 8': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/618230898.pdf" },
      { title: 'Asan Urdu', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1770275264.pdf" },
      { title: 'English', icon: 'translate', color: '#3498db' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/931205089.pdf"},
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1542725854.pdf" },
      { title: 'Mathematics English', icon: 'calculate', color: '#e74c3c',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/661220288.pdf" },
      { title: 'Computer', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1733850881.pdf"  },
      { title: 'Computer English', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1946780717.pdf"  },
      {  title: 'Scinece English', icon: 'computer', color: '#2c3e50',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/305464905.pdf"  },
      { title: 'Arabic ', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1978158975.pdf"},
      { title: 'Mazhabi Taleemat', icon: 'mosque', color: '#16a085' ,url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1960318805.pdf"},
      { title: 'Science', icon: 'science', color: '#9b59b6',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/655700241.pdf" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/2054365254.pdf" },
      { title: 'Islamiyat English', icon: 'mosque', color: '#16a085',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/424365329.pdf" },
      { title: 'Pakistan Studies English', icon: 'account-balance', color: '#8e44ad',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1852132285.pdf"},
      { title: 'Sindhi Reader', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/341084115.pdf" },
      { title: 'Asaan Sindhi', icon: 'language', color: '#e67e22',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/686866583.pdf" }
    ],
    'Grade 9': [
      { title: ' ASAN Urdu IX-X', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1837638201.pdf" },
      { title: ' ASAN Lazmi IX-X', icon: 'menu-book', color: '#27ae60',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1028329168.pdf" },
      { title: 'English', icon: 'translate', color: '#3498db',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/931205089.pdf" },
      { title: 'Islamiyat English', icon: 'mosque', color: '#16a085',url:"" },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1698156939.pdf" },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:"https://ebooks.stbb.edu.pk/storage/uploads/books/1208609762.pdf" },
      { title: 'Mathematics English', icon: 'calculate', color: '#e74c3c',url:"f" },
      { title: 'Computer English', icon: 'bolt', color: '#f1c40f',url:"" },
      { title: 'Computer Science', icon: 'bolt', color: '#f1c40f',url:"" },
      { title: 'Science ENGLISH', icon: 'bolt', color: '#f1c40f',url:"" },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6',url:"" },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71',url:""  },
      { title: 'Pakistan Studies', icon: 'account-balance', color: '#8e44ad',url:""  },
      { title: 'Pakistan Studies English', icon: 'account-balance', color: '#8e44ad',url:""  },
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:""  },
     { title: 'Sindhi', icon: 'language', color: '#e67e22',url:""  }

    ],
    'Grade 10': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' ,url:"" },
      { title: 'English', icon: 'translate', color: '#3498db',url:""  },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:""  },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f',url:""  },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6',url:""  },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71',url:""  },
      { title: 'Pakistan Studies', icon: 'account-balance', color: '#8e44ad',url:""  },
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:""  }
    ],
    'Grade 11': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f',url:""  },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6',url:""  },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71',url:""  },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:""  },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:""  },
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:""  }
    ],
    'Grade 12': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f',url:""  },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6',url:"" },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71',url:""  },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c',url:""  },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50',url:""  },
      { title: 'Sindhi', icon: 'language', color: '#e67e22',url:""  }
    ]
  },
  'KPK Board': {
    'Pre-Primary (KG)': [
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'Math', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Knowledge', icon: 'public', color: '#f39c12' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 1': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Knowledge', icon: 'public', color: '#f39c12' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 2': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Knowledge', icon: 'public', color: '#f39c12' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 3': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 4': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Social Studies', icon: 'public', color: '#f39c12' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 5': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Social Studies', icon: 'public', color: '#f39c12' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 6': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Geography', icon: 'map', color: '#1abc9c' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 7': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Geography', icon: 'map', color: '#1abc9c' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 8': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Geography', icon: 'map', color: '#1abc9c' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 9': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 10': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 11': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ],
    'Grade 12': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Computer Science', icon: 'computer', color: '#2c3e50' },
      { title: 'Pashto', icon: 'language', color: '#8e44ad' }
    ]
  },
  'Balochistan Board': {
    'Pre-Primary (KG)': [
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'Math', icon: 'calculate', color: '#e74c3c' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 1': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 2': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 3': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Science', icon: 'science', color: '#9b59b6' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 4': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'History', icon: 'history', color: '#d35400' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 5': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'History', icon: 'history', color: '#d35400' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 6': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'History', icon: 'history', color: '#d35400' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 7': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'History', icon: 'history', color: '#d35400' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 8': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'History', icon: 'history', color: '#d35400' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 9': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 10': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 11': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Statistics', icon: 'bar-chart', color: '#3498db' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ],
    'Grade 12': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Statistics', icon: 'bar-chart', color: '#3498db' },
      { title: 'Balochi', icon: 'language', color: '#d35400' }
    ]
  },
  'AJK Board': {
    'Pre-Primary (KG)': [
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'Math', icon: 'calculate', color: '#e74c3c' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 1': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 2': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 3': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'General Science', icon: 'science', color: '#9b59b6' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 4': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 5': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 6': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 7': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 8': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Science', icon: 'science', color: '#9b59b6' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 9': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 10': [
      { title: 'Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'English', icon: 'translate', color: '#3498db' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Islamiyat', icon: 'mosque', color: '#16a085' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 11': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Accounting', icon: 'account-balance', color: '#8e44ad' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ],
    'Grade 12': [
      { title: 'Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'Mathematics', icon: 'calculate', color: '#e74c3c' },
      { title: 'Accounting', icon: 'account-balance', color: '#8e44ad' },
      { title: 'Kashmiri', icon: 'language', color: '#1abc9c' }
    ]
  },
  'Oxford Board': {
    'O-Level': [
      { title: 'O-Level English', icon: 'translate', color: '#3498db' },
      { title: 'O-Level Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'O-Level Math', icon: 'functions', color: '#e74c3c' },
      { title: 'O-Level Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'O-Level Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'O-Level Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'O-Level Pakistan Studies', icon: 'account-balance', color: '#8e44ad' },
      { title: 'O-Level Islamiat', icon: 'mosque', color: '#16a085' },
      { title: 'O-Level Computer Science', icon: 'computer', color: '#2c3e50' },
      { title: 'O-Level Economics', icon: 'trending-up', color: '#e67e22' },
      { title: 'O-Level Accounting', icon: 'account-balance', color: '#8e44ad' }
    ],
    'A-Level': [
      { title: 'A-Level English', icon: 'translate', color: '#3498db' },
      { title: 'A-Level Urdu', icon: 'menu-book', color: '#27ae60' },
      { title: 'A-Level Math', icon: 'functions', color: '#e74c3c' },
      { title: 'A-Level Physics', icon: 'bolt', color: '#f1c40f' },
      { title: 'A-Level Chemistry', icon: 'science', color: '#9b59b6' },
      { title: 'A-Level Biology', icon: 'biotech', color: '#2ecc71' },
      { title: 'A-Level Computer Science', icon: 'computer', color: '#2c3e50' },
      { title: 'A-Level Economics', icon: 'trending-up', color: '#e67e22' },
      { title: 'A-Level Accounting', icon: 'account-balance', color: '#8e44ad' },
      { title: 'A-Level Business Studies', icon: 'business', color: '#34495e' }
    ]
  }
};

const Books = () => {
  const boards = Object.keys(boardData);
  const [selectedBoard, setSelectedBoard] = useState(boards[0] || '');
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
  const [activeTabIndicator] = useState(new Animated.Value(0));

  const handleSubjectPress = async(board, classLevel, subjectTitle,subject) => {
    // setLoading(true);
          const supported = await Linking.canOpenURL(subject.url);

  
      await Linking.openURL(subject.url);
    
   
  };

  const handleBoardSelect = (board, index) => {
    setSelectedBoard(board);
    setSelectedClass(null); // Reset selected class when board changes
    Animated.spring(activeTabIndicator, {
      toValue: index,
      useNativeDriver: true,
    }).start();
    
    const tabOffset = index * (width * 0.3 + 10);
    scrollViewRef.current?.scrollTo({ 
      x: tabOffset - width / 2 + (width * 0.3) / 2, 
      animated: true 
    });
  };

  const handleClassSelect = (classLevel) => {
    setSelectedClass(selectedClass === classLevel ? null : classLevel);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const inputRange = boards.map((_, i) => i * (width * 0.3 + 10));
  const translateX = activeTabIndicator.interpolate({
    inputRange: boards.map((_, i) => i),
    outputRange: inputRange,
  });

  // Filter data based on search query
  const filteredClasses = {};
  if (boardData[selectedBoard]) {
    Object.entries(boardData[selectedBoard]).forEach(([classLevel, subjects]) => {
      const filteredSubjects = subjects.filter(subject => 
        subject.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredSubjects.length > 0) {
        filteredClasses[classLevel] = filteredSubjects;
      }
    });
  }

  // Sort classes in order from KG to Grade 12
  const sortedClassLevels = Object.keys(filteredClasses).sort((a, b) => {
    const getClassOrder = (className) => {
      if (className.includes('Pre-Primary')) return 0;
      if (className.includes('Grade')) return parseInt(className.split(' ')[1]);
      if (className.includes('O-Level')) return 13;
      if (className.includes('A-Level')) return 14;
      return 15;
    };
    return getClassOrder(a) - getClassOrder(b);
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Board-wise Curriculum</Text>
        <Text style={styles.subHeader}>Select your board to view subjects</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subjects..."
          placeholderTextColor="#95a5a6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Icon name="close" size={20} color="#95a5a6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabWrapper}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabContainer}
        >
          {boards.map((board, index) => (
            <TouchableOpacity
              key={board}
              style={[styles.tab, selectedBoard === board && styles.activeTab]}
              onPress={() => handleBoardSelect(board, index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Icon 
                  name={BOARD_ICONS[board]} 
                  size={20} 
                  color={selectedBoard === board ? '#0984e3' : '#636e72'} 
                  style={styles.boardIcon}
                />
                <Text style={[styles.tabText, selectedBoard === board && styles.activeTabText]}>
                  {board.replace(' Board', '')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Animated.View style={[styles.tabIndicator, { transform: [{ translateX }], width: width * 0.3 }]} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0984e3" />
          <Text style={styles.loadingText}>Loading resources...</Text>
        </View>
      )}

      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0984e3']}
            tintColor="#0984e3"
          />
        }
      >
        {sortedClassLevels.length > 0 ? (
          sortedClassLevels.map((classLevel) => (
            <View key={classLevel} style={styles.classSection}>
              <TouchableOpacity 
                style={styles.classHeader}
                onPress={() => handleClassSelect(classLevel)}
                activeOpacity={0.7}
              >
                <View style={styles.classIconContainer}>
                  <Icon 
                    name={
                      classLevel.includes('Pre-Primary') ? 'child-care' : 
                      classLevel.includes('Grade 1') || classLevel.includes('Grade 2') || classLevel.includes('Grade 3') ? 'child-friendly' : 
                      classLevel.includes('Grade 4') || classLevel.includes('Grade 5') || classLevel.includes('Grade 6') ? 'school' : 
                      classLevel.includes('Grade 7') || classLevel.includes('Grade 8') ? 'assignment-ind' : 
                      classLevel.includes('Grade 9') || classLevel.includes('Grade 10') ? 'assignment' : 
                      classLevel.includes('O-Level') ? 'star' : 'class'
                    } 
                    size={20} 
                    color="#0984e3" 
                  />
                </View>
                <Text style={styles.classTitle}>{classLevel}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.subjectCount}>{filteredClasses[classLevel].length} subjects</Text>
                  <Icon 
                    name={selectedClass === classLevel ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                    size={24} 
                    color="#95a5a6" 
                  />
                </View>
              </TouchableOpacity>
              
              {selectedClass === classLevel && (
                <View style={styles.subjectsContainer}>
                  {filteredClasses[classLevel].map((subject, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.card}
                      onPress={() => handleSubjectPress(selectedBoard, classLevel, subject.title,subject)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardContent}>
                        <View style={[styles.iconContainer, { backgroundColor: `${subject.color}20` }]}>
                          <Icon name={subject.icon} size={20} color={subject.color} />
                        </View>
                        <Text style={styles.subjectTitle}>{subject.title}</Text>
                        <Icon name="chevron-right" size={24} color="#bdc3c7" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>No subjects found</Text>
            <Text style={styles.emptySubText}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  subHeader: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3436',
  },
  clearSearch: {
    padding: 5,
  },
  tabWrapper: {
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
    backgroundColor: '#fff',
  },
  tabContainer: {
    paddingHorizontal: 15,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    minWidth: width * 0.3,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardIcon: {
    marginRight: 5,
  },
  tabText: {
    color: '#636e72',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0984e3',
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#0984e3',
    borderRadius: 3,
  },
  contentContainer: {
    padding: 15,
  },
  classSection: {
    marginBottom: 15,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  classIconContainer: {
    backgroundColor: '#e3f2fd',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    flex: 1,
  },
  subjectCount: {
    fontSize: 14,
    color: '#95a5a6',
    marginRight: 5,
  },
  subjectsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
    padding: 8,
    elevation: 1,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2d3436',
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    color: '#0984e3',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
});

export default Books;