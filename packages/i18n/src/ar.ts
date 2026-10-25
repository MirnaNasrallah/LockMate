import type { MessageKey } from './en.ts';

// Typed against English, so a missing or misspelled key fails the type check.
// Written for Arabic readers, not translated word for word (brand voice); needs a native review before launch.
export const ar: Record<MessageKey, string> = {
  'app.name': 'Lockmate',
  'app.tagline': 'التزم، ونحن معك.',
  'language.en': 'الإنجليزية',
  'language.ar': 'العربية',
  'status.title': 'حالة الخدمة',
  'status.checking': 'جارٍ التحقق…',
  'status.connected': 'متصل',
  'status.answeringIn': 'الردود باللغة {language}',
  'status.unreachable': 'تعذّر الوصول إلى الخدمة',
  'status.retry': 'إعادة المحاولة',
  'auth.field.name': 'الاسم',
  'auth.field.email': 'البريد الإلكتروني',
  'auth.field.password': 'كلمة المرور',
  'auth.signIn.title': 'أهلاً بعودتك',
  'auth.signIn.submit': 'تسجيل الدخول',
  'auth.signIn.switch': 'جديد هنا؟ أنشئ حساباً',
  'auth.signIn.failed': 'البريد الإلكتروني وكلمة المرور غير متطابقين.',
  'auth.signUp.title': 'التزم بحساب خاص بك',
  'auth.signUp.submit': 'إنشاء الحساب',
  'auth.signUp.switch': 'لديك حساب بالفعل؟ سجّل الدخول',
  'auth.error.name': 'أخبرنا باسمك.',
  'auth.error.email': 'استخدم بريداً إلكترونياً صحيحاً وغير مسجّل من قبل.',
  'auth.error.password': 'كلمة المرور قصيرة جداً.',
  'auth.error.tooMany': 'محاولات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.',
  'auth.error.network': 'تعذّر الوصول إلى Lockmate. تحقّق من اتصالك.',
  'auth.signOut': 'تسجيل الخروج',
  'home.greeting': 'أهلاً {name}',
};
